import { inject, injectable } from 'tsyringe';
import {
  ConfirmBookingDTO,
  ConfirmBookingResponseDTO,
  IBookingService,
  InitiateBookingDTO,
  InitiateBookingResponseDTO,
} from '../../interfaces/service_interfaces/user/IBookingService';
import { ISeatReservationRepository } from '../../interfaces/repository_interfaces/ISeatReservationRepository';
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
import { BOOKING_STATUS, PAYMENT_STATUS, SEAT_HOLD_DURATION_MS } from '../../shared/constants/booking';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepo: ISchedulePackageRepository,
    @inject('IBasePackageRepository')
    private _packageRepo: IBasePackageRepository,
    @inject('IBookingRepository')
    private _bookingRepo: IBookingRepository,
    @inject('IPaymentGateway')
    private paymentGateway: IPaymentGateway,
  ) {}

  async initiateBooking(
  payload: InitiateBookingDTO,
): Promise<InitiateBookingResponseDTO> {
  let session: mongoose.ClientSession | null = null;

  try {
    // ─────────────────────────────────────────────
    // 1. Validate schedule
    // ─────────────────────────────────────────────
    const schedule = await this._schedulePackageRepo.findById(
      payload.scheduleId,
    );

    if (!schedule) {
      throw new AppError(
        ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (schedule.status !== SCHEDULE_STATUS.UPCOMING) {
      throw new AppError(
        statusMessages[schedule.status] ??
          ERROR_MESSAGES.SCHEDULE_NOT_AVAILABLE_FOR_BOOKING,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // ─────────────────────────────────────────────
    // 2. Validate package
    // ─────────────────────────────────────────────
    const pkg = await this._packageRepo.findById(
      schedule.packageId.toString(),
    );

    if (!pkg) {
      throw new AppError(
        ERROR_MESSAGES.PACKAGE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      pkg.status !== PACKAGE_STATUS.PUBLISHED ||
      !pkg.isActive
    ) {
      throw new AppError(
        ERROR_MESSAGES.PACKAGE_NOT_AVAILABLE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // ─────────────────────────────────────────────
    // 3. Validate tier
    // ─────────────────────────────────────────────
    const priceTier = schedule.pricing.find(
      (tier) => tier.type === payload.tierType,
    );

    if (!priceTier) {
      throw new AppError(
        ERROR_MESSAGES.INVALID_TIER_TYPE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (priceTier.peopleCount !== payload.seatsCount) {
      throw new AppError(
        `Selected tier is for ${priceTier.peopleCount} people, but ${payload.seatsCount} seats were requested.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!priceTier.price || priceTier.price <= 0) {
      throw new AppError(
        ERROR_MESSAGES.INVALID_GROUP_TYPE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // ─────────────────────────────────────────────
    // 4. Validate travelers
    // ─────────────────────────────────────────────
    if (
      !payload.travelers ||
      payload.travelers.length !== payload.seatsCount
    ) {
      throw new AppError(
        ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const leads = payload.travelers.filter(
      (traveler) => traveler.isLead,
    );

    if (leads.length !== 1) {
      throw new AppError(
        ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const leadTraveler = leads[0];

    if (!leadTraveler.phoneNumber?.trim()) {
      throw new AppError(
        ERROR_MESSAGES.TRAVELER_INFO_INCOMPLETE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // ─────────────────────────────────────────────
    // 5. Duplicate booking check
    // ─────────────────────────────────────────────
    const existingBooking =
      await this._bookingRepo.findActiveBookingByUserAndSchedule(
        payload.userId,
        payload.scheduleId,
      );

    if (existingBooking) {
      throw new AppError(
        ERROR_MESSAGES.ALREADY_HAVE_ACTIVE_BOOKING,
        HTTP_STATUS.CONFLICT,
      );
    }

    // ─────────────────────────────────────────────
    // 6. Financial calculation
    // ─────────────────────────────────────────────
    const discountAmount = 0;
    const walletAmountUsed = 0;

    const finalAmount =
      priceTier.price -
      discountAmount -
      walletAmountUsed;

    const platformCommission =
      Math.round(
        priceTier.price *
          PLATFORM_COMMISSION_RATE *
          100,
      ) / 100;

    const vendorEarning =
      Math.round(
        (priceTier.price - platformCommission) *
          100,
      ) / 100;

    const seatHoldExpiry = new Date(
      Date.now() + SEAT_HOLD_DURATION_MS,
    );

    // ─────────────────────────────────────────────
    // 7. Start transaction
    // ─────────────────────────────────────────────
    session = await mongoose.startSession();
    session.startTransaction();

    // Hold seats INSIDE transaction only
    const held =
      await this._schedulePackageRepo.holdSeats(
        payload.scheduleId,
        payload.seatsCount,
        session,
      );

    if (held.modifiedCount === 0) {
      throw new AppError(
        ERROR_MESSAGES.FAILED_TO_RESERVE_SEAT,
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create booking
    const booking =
      await this._bookingRepo.createBooking(
        {
          userId: new mongoose.Types.ObjectId(
            payload.userId,
          ),
          packageId: new mongoose.Types.ObjectId(
            payload.packageId,
          ),
          scheduleId: new mongoose.Types.ObjectId(
            payload.scheduleId,
          ),
          vendorId: schedule.vendorId,

          groupType: payload.tierType,
          travelerCount: payload.seatsCount,
          seatHoldExpiry,

          travelers: payload.travelers.map(
            (traveler) => ({
              ...traveler,
            }),
          ),

          grossAmount: priceTier.price,
          discountAmount,
          walletAmountUsed,
          finalAmount,
          platformCommission,
          vendorEarning,

          paymentStatus: PAYMENT_STATUS.PENDING,
          bookingStatus: BOOKING_STATUS.PENDING,
        },
        session,
      );

    await session.commitTransaction();
    await session.endSession();
    session = null;

    // ─────────────────────────────────────────────
    // 8. Create payment intent AFTER commit
    // ─────────────────────────────────────────────
    try {
      const payment =
        await this.paymentGateway.createPaymentIntent(
          {
            amount: priceTier.price,
            currency: "inr",
            bookingId: booking._id.toString(),
            metadata: {
              userId: payload.userId,
              scheduleId: payload.scheduleId,
              bookingId:
                booking._id.toString(),
              tierType: payload.tierType,
              seatsCount: String(
                payload.seatsCount,
              ),
            },
          },
        );

      await this._bookingRepo.attachPaymentIntent(
        booking._id.toString(),
        payment.gatewayPaymentId,
      );

      return {
        clientSecret: payment.clientSecret!,
        bookingId: booking._id.toString(),
        expiresAt:
          seatHoldExpiry.toISOString(),
      };
    } catch (paymentError) {
      // Payment intent failed after booking created

      await this._schedulePackageRepo.releaseHeldSeats(
        payload.scheduleId,
        payload.seatsCount,
      );

      await this._bookingRepo.markFailedPayment(
        booking._id.toString(),
      );

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
    //  Verify booking exists and belongs to user
    const booking = await this._bookingRepo.findByIdAndUser(payload.bookingId, payload.userId);
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // already confirmed
    if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
      return {
        bookingId: booking._id.toString(),
        message: SUCCESS_MESSAGES.BOOKING_ALREADY_CONFIRMED,
      };
    }

    // check if the payment intent ID matches
    if (booking.transactionId !== payload.stripePaymentIntentId) {
      throw new AppError(ERROR_MESSAGES.INVALID_PAYMENT_INTENT_ID, HTTP_STATUS.BAD_REQUEST);
    }

    // Confirm payment with gateway
    const paymentConfirmed = await this.paymentGateway.confirmPayment(
      payload.stripePaymentIntentId!,
    );

    if (!paymentConfirmed) {
      await this._bookingRepo.markFailedPayment(booking._id.toString());
      await this._schedulePackageRepo.releaseHeldSeats(
        booking.scheduleId.toString(),
        booking.travelerCount,
      );
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await this._schedulePackageRepo.confirmSeats(
        booking.scheduleId.toString(),
        booking.travelerCount,
        session,
      );

      const updatedBooking = await this._bookingRepo.confirmBooking(
        payload.userId.toString(),
        booking.scheduleId.toString(),
        payload.bookingId.toString(),
        session,
      );
      await session.commitTransaction();
      session.endSession();

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
}
