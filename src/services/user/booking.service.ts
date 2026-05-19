import { inject, injectable } from 'tsyringe';
import {
  CancelBookingDTO,
  CancelBookingResponseDTO,
  ConfirmBookingDTO,
  ConfirmBookingResponseDTO,
  GetBookingsDTO,
  IBookingService,
  InitiateBookingDTO,
  InitiateBookingResponseDTO,
  PaginatedBookingResponse,
  VerifyPaymentResponseDTO,
} from '../../interfaces/service_interfaces/user/IBookingService';
import { ISchedulePackageRepository } from '../../interfaces/repository_interfaces/ISchedulePackage';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../../shared/constants/constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { statusMessages } from '../../shared/constants/schedule-status';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { IBookingRepository } from '../../interfaces/repository_interfaces/IBookingRepository';
import { PLATFORM_COMMISSION_RATE } from '../../shared/constants/platform';
import { IPaymentGateway } from '../../infrastructure/payment-gateways/IPaymentGateway';
import mongoose from 'mongoose';
import {
  BOOKING_STATUS,
  CANCELATION_STATUS,
  CANCELLED_BY,
  PAYMENT_STATUS,
  VERIFY_PAYMENT_STATUS,
} from '../../shared/constants/booking';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { generateBookingCode } from '../../shared/utils/generate-booking-code.helper';
import {
  BookingDetailDTO,
  BookingMapper,
  CancellationPolicy,
  RawPopulatedBooking,
} from '../../shared/mappers/booking.mapper';
import { INotificationService } from '../../interfaces/service_interfaces/INotificationService';
import {
  UserNotificationType,
  VendorNotificationType,
} from '../../types/entities/notification.entity';
import { USER_ROLES } from '../../shared/constants/roles';
import { IChatService } from '../../interfaces/service_interfaces/IChatService';
import { generateChatName } from '../../shared/utils/chat-name-builder';
import { IChatRepository } from '../../interfaces/repository_interfaces/IChatRepository';
import { ICancellationPolicyRepository } from '../../interfaces/repository_interfaces/ICancellationPolicyRepository';
import { computeRefundBreakdown } from '../../shared/utils/cancellation-policy/policy-refund-calculator';
import { getApplicableCancellationWindow } from '../../shared/utils/cancellation-policy/get-days-left';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject('INotificationService')
    private _notificationService: INotificationService,
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepo: ISchedulePackageRepository,
    @inject('IBasePackageRepository')
    private _packageRepo: IBasePackageRepository,
    @inject('IBookingRepository')
    private _bookingRepo: IBookingRepository,
    @inject('IPaymentGateway')
    private paymentGateway: IPaymentGateway,
    @inject('IChatService')
    private _chatService: IChatService,
    @inject('IChatRepository')
    private _chatRepo: IChatRepository,
    @inject('ICancellationPolicyRepository')
    private _cancellationPolicyRepo: ICancellationPolicyRepository,
  ) {}

  async initiateBooking(payload: InitiateBookingDTO): Promise<InitiateBookingResponseDTO> {
    let session: mongoose.ClientSession | null = null;

    try {
      const sheduleId = toObjectId(payload.scheduleId);

      const schedule = await this._schedulePackageRepo.findOne({ _id: sheduleId });

      if (!schedule) {
        throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      if (schedule.status !== SCHEDULE_STATUS.UPCOMING) {
        throw new AppError(
          statusMessages[schedule.status] ?? ERROR_MESSAGES.SCHEDULE_NOT_AVAILABLE_FOR_BOOKING,
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      const pkg = await this._packageRepo.findOne({ _id: schedule.packageId });

      if (!pkg) {
        throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      if (pkg.status !== PACKAGE_STATUS.PUBLISHED || !pkg.isActive) {
        throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_AVAILABLE, HTTP_STATUS.BAD_REQUEST);
      }

      // Validate tier
      const priceTier = schedule.pricing.find((tier) => tier.type === payload.tierType);

      if (!priceTier) {
        throw new AppError(ERROR_MESSAGES.INVALID_TIER_TYPE, HTTP_STATUS.BAD_REQUEST);
      }

      if (priceTier.peopleCount !== payload.seatsCount) {
        throw new AppError(
          `Selected tier is for ${priceTier.peopleCount} people, but ${payload.seatsCount} seats were requested.`,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      if (!priceTier.price || priceTier.price <= 0) {
        throw new AppError(ERROR_MESSAGES.INVALID_GROUP_TYPE, HTTP_STATUS.BAD_REQUEST);
      }
      // Validate travelers
      if (!payload.travelers || payload.travelers.length !== payload.seatsCount) {
        throw new AppError(ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE, HTTP_STATUS.BAD_REQUEST);
      }

      const leads = payload.travelers.filter((traveler) => traveler.isLead);

      if (leads.length !== 1) {
        throw new AppError(ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE, HTTP_STATUS.BAD_REQUEST);
      }

      const leadTraveler = leads[0];

      if (!leadTraveler.phoneNumber?.trim()) {
        throw new AppError(ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE, HTTP_STATUS.BAD_REQUEST);
      }

      const existingBooking = await this._bookingRepo.findActiveBookingByUserAndSchedule(
        payload.userId,
        payload.scheduleId,
      );

      if (existingBooking?.bookingStatus === BOOKING_STATUS.CONFIRMED) {
        throw new AppError(ERROR_MESSAGES.ALREADY_HAVE_ACTIVE_BOOKING, HTTP_STATUS.CONFLICT);
      }

      // 6. Financial calculation
      // ──────────────────────────────────────
      const discountAmount = 0;
      const walletAmountUsed = 0;

      const finalAmount = priceTier.price - discountAmount - walletAmountUsed;

      const platformCommission = Math.round(priceTier.price * PLATFORM_COMMISSION_RATE * 100) / 100;

      const vendorEarning = Math.round((priceTier.price - platformCommission) * 100) / 100;

      //  Start transaction
      session = await mongoose.startSession();
      session.startTransaction();

      // Create booking
      const booking = await this._bookingRepo.createBooking(
        {
          userId: new mongoose.Types.ObjectId(payload.userId),
          packageId: new mongoose.Types.ObjectId(payload.packageId),
          scheduleId: new mongoose.Types.ObjectId(payload.scheduleId),
          vendorId: schedule.vendorId,

          bookingCode: generateBookingCode(),
          groupType: payload.tierType,
          travelerCount: payload.seatsCount,

          travelers: payload.travelers.map((traveler) => ({
            ...traveler,
          })),

          grossAmount: priceTier.price,
          discountAmount,
          walletAmountUsed,
          finalAmount,
          platformCommission:Math.round(platformCommission),
          vendorEarning:Math.round(vendorEarning),

          paymentStatus: PAYMENT_STATUS.PENDING,
          bookingStatus: BOOKING_STATUS.PENDING,
        },
        session,
      );

      await session.commitTransaction();
      await session.endSession();
      session = null;

      //  Create payment intent

      try {
        const payment = await this.paymentGateway.createPaymentIntent({
          amount: priceTier.price,
          currency: 'inr',
          bookingId: booking._id.toString(),
          metadata: {
            userId: payload.userId,
            scheduleId: payload.scheduleId,
            tierType: payload.tierType,
            seatsCount: String(payload.seatsCount),
            startDate: schedule.startDate?.toISOString().split('T')[0] ?? '',
            endDate: schedule.endDate?.toISOString().split('T')[0] ?? '',
            packageName: pkg.title ?? '',
          },
        });

        await this._bookingRepo.attachPaymentIntent(
          booking._id.toString(),
          payment.gatewayPaymentId,
        );

        return {
          clientSecret: payment.clientSecret!,
          bookingId: booking._id.toString(),
          checkoutUrl: payment.url,
        };
      } catch {
        await this._bookingRepo.markFailedPayment(booking._id.toString());

        throw new AppError(
          ERROR_MESSAGES.PAYMENT_CONFIRMATION_FAILED,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (_) {}

        await session.endSession();
      }
      throw error;
    }
  }

  async confirmBooking(payload: ConfirmBookingDTO): Promise<ConfirmBookingResponseDTO> {
    const booking = await this._bookingRepo.findByIdAndUserLean(payload.bookingId, payload.userId);
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
      return {
        bookingId: booking._id.toString(),
        message: SUCCESS_MESSAGES.BOOKING_ALREADY_CONFIRMED,
      };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedBooking = await this._bookingRepo.confirmBooking(
        payload.userId.toString(),
        payload.bookingId.toString(),
        payload.stripePaymentIntentId,
        session,
      );

      await this._schedulePackageRepo.confirmSeats(
        booking.scheduleId.toString(),
        booking.travelerCount,
        session,
      );

      await session.commitTransaction();
      session.endSession();

      const schedule = await this._schedulePackageRepo.findById(booking.scheduleId.toString());
      if (!schedule) {
        throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await Promise.all([
        this._notificationService.createNotification({
          recipientId: booking.userId.toString(),
          recipientRole: USER_ROLES.USER,
          senderId: booking.vendorId.toString(),
          notificationType: UserNotificationType.BookingConfirmed,
          title: 'Booking Confirmed',
          message: `Your booking for "${booking.packageId?.title}" has been confirmed.`,
          data: {
            bookingUId: booking._id.toString(),
            bookingId: booking.bookingCode,
            packageName: booking.packageId.title,
          },
          redirectUrl: `/user/bookings/${booking._id.toString()}`,
        }),

        this._notificationService.createNotification({
          recipientId: booking.vendorId.toString(),
          recipientRole: USER_ROLES.VENDOR,
          senderId: booking.userId.toString(),
          notificationType: VendorNotificationType.NewBooking,
          title: 'New Booking',
          message: `You have a new booking for "${booking.packageId?.title}".`,
          data: {
            bookingId: booking._id.toString(),
            bookingCode: booking.bookingCode,
            scheduleId: booking.scheduleId.toString(),
            packageId: booking.packageId._id.toString(),
            packageName: booking.packageId.title,
          },
          redirectUrl: `/bookings/${booking._id.toString()}`,
        }),
      ]);
      // ── 4. Create chat room
      await this._chatService.ensureRoomExists(
        generateChatName(booking.packageId.title, schedule.startDate.toISOString()),
        toObjectId(booking.scheduleId.toString()),
        toObjectId(booking.packageId._id.toString()),
        toObjectId(booking.vendorId.toString()),
        toObjectId(booking.userId.toString()),
      );

      return {
        bookingId: updatedBooking!._id.toString(),
        message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async verifyPayment(stripeSessionId: string): Promise<VerifyPaymentResponseDTO> {
    const session = await this.paymentGateway.verifyStripeSession(stripeSessionId);

    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return { status: VERIFY_PAYMENT_STATUS.FAILURE };
    }

    if (session.payment_status !== 'paid') {
      return { status: VERIFY_PAYMENT_STATUS.FAILURE };
    }

    const booking = await this._bookingRepo.findById(bookingId);
    if (!booking) {
      return { status: VERIFY_PAYMENT_STATUS.FAILURE };
    }
    return {
      status:
        booking.bookingStatus === BOOKING_STATUS.CONFIRMED
          ? VERIFY_PAYMENT_STATUS.SUCCESS
          : VERIFY_PAYMENT_STATUS.FAILURE,
      bookingId: booking.bookingCode,
      amount: booking.grossAmount,
    };
  }

  async getBookings(userId: string, filters: GetBookingsDTO): Promise<PaginatedBookingResponse> {
    const { bookings, total } = await this._bookingRepo.findBookings({
      userId,
      bookingStatus: filters.bookingStatus,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    });

    return {
      bookings,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getBookingDetails(userId: string, bookingId: string): Promise<BookingDetailDTO> {
    const booking = await this._bookingRepo.findByIdAndUser(bookingId, userId);
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const chatRoom = await this._chatRepo.findChatRoomByScheduleId(booking.scheduleId);

    const bookingDetail = BookingMapper.toDetailedResponse(booking as RawPopulatedBooking);

    return {
      ...bookingDetail,
      chatId:chatRoom?._id.toString()
    }
  }

  async cancelBookingRequest(payload: CancelBookingDTO): Promise<CancelBookingResponseDTO> {
    const booking = await this._bookingRepo.findByIdAndUser(payload.bookingId, payload.userId);
    console.log("booking",booking);
    
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED  || booking.cancellationStatus) {
      throw new AppError(
        ERROR_MESSAGES.BOOKING_CANNOT_BE_CANCELLED,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const schedule = await this._schedulePackageRepo.findById(booking.scheduleId._id.toString());

    if (!schedule) {
      throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const pkg = await this._packageRepo.findOne({ _id: booking.packageId._id });
    if (!pkg) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!pkg.cancellationPolicy) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_POLICY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const policy = await this._cancellationPolicyRepo.findById(
      pkg.cancellationPolicy.toString(),
    );

    if (!policy) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_POLICY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const {isWindowApplicable} = getApplicableCancellationWindow(policy.rules, schedule.startDate.toString());
    
    if (!isWindowApplicable) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_POLICY_NOT_APPLICABLE, HTTP_STATUS.BAD_REQUEST);
    }

    const policyDTO: CancellationPolicy = {
      id: policy._id.toString(),
      key: policy.key,
      label: policy.label,
      rules: policy.rules.map((r) => ({
        daysBeforeTrip: r.daysBeforeTrip,
        refundPercent: r.refundPercent,
      })),
      isActive: policy.isActive,
    };

    const refundBreakdown = computeRefundBreakdown(
      booking.finalAmount,
      policyDTO,
      schedule.startDate,
    );

    const cancellationReason = payload.details
      ? `${payload.reason} — ${payload.details}`
      : payload.reason;

    try {
      const updatedBooking = await this._bookingRepo.cancelBooking(
        payload.bookingId,
        payload.userId,
        {
          cancellationReason,
          cancellationStatus: CANCELATION_STATUS.PENDING,
          cancelledAt: new Date(),
          cancelationRefundAmount: Math.floor(refundBreakdown.refundAmount),
       
        },
      );

      if (!updatedBooking) {
        throw new AppError(ERROR_MESSAGES.BOOKING_CANCELLATION_FAILED, HTTP_STATUS.BAD_REQUEST);
      }

      await this._notificationService.createNotification({
          recipientId: booking.vendorId._id.toString(),
          recipientRole: USER_ROLES.VENDOR,
          senderId: booking.userId.toString(),
          notificationType: UserNotificationType.BookingCancelRequest,
          title: 'Booking Cancellation Requested',
          message: `Cancellation request for "${pkg.title}" is pending review. Estimated refund: ₹${refundBreakdown.refundAmount} (${refundBreakdown.refundPercent}%).`,
          data: {
            packageId: pkg._id.toString(),
            bookingCode: booking.bookingCode,
            refundAmount: refundBreakdown.refundAmount,
            refundPercent: refundBreakdown.refundPercent,
          },
          redirectUrl: ``
        })
      return {
        refundAmount: refundBreakdown.refundAmount,
        refundPercent: refundBreakdown.refundPercent,
      };
    } catch (error) {
      throw error;
    }
  }
}
