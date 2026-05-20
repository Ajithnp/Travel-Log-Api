import { inject, injectable } from 'tsyringe';
import { DetailedCancellationRequestResponseDTO, IAdminUserService } from '../../interfaces/service_interfaces/admin/IAdminUserService';
import { IUser } from '../../types/entities/user.entity';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, NOTIFICATION_MESSAGES, NOTIFICATION_TITLES, REDIRECT_URL } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ITokenService } from '../../interfaces/service_interfaces/ITokenService';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { UserProfileResponseDTO } from '../../types/dtos/user/response.dtos';
import { IBookingRepository } from '../../interfaces/repository_interfaces/IBookingRepository';
import { PopulatedCancellationRequest } from '../../types/entities/booking.entity';
import { computeRefundBreakdown } from '../../shared/utils/cancellation-policy/policy-refund-calculator';
import { BookingMapper } from '../../shared/mappers/booking.mapper';
import { BOOKING_STATUS, CANCELATION_STATUS } from '../../shared/constants/booking';
import { INotificationService } from '../../interfaces/service_interfaces/INotificationService';
import { USER_ROLES } from '../../shared/constants/roles';
import { AdminNotificationType } from '../../types/entities/notification.entity';
import logger from '../../config/logger';

@injectable()
export class AdminUserService implements IAdminUserService {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('ITokenService')
    private _tokenService: ITokenService,
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('INotificationService')
    private _notificationService: INotificationService,
  ) { }

  async fetchUsers(
    page: number,
    limit: number,
    role: IUser['role'],
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<UserProfileResponseDTO>>> {
    const skip = (page - 1) * limit;
    const query: FilterQuery<IUser> = { role };

    if (search && search.trim() !== '') {
      query.name = { $regex: search, $options: 'i' };
    }
    if (selectedFilter === 'active') query.isBlocked = false;
    if (selectedFilter === 'blocked') query.isBlocked = true;

    const [usersDoc, totalDocs] = await Promise.all([
      this._userRepository.findAll(query, { skip, limit, sort: { createdAt: -1 } }),
      this._userRepository.countDocuments(query),
    ]);

    const userData: UserProfileResponseDTO[] = usersDoc.map((user) => ({
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt.toDateString(),
    }));

    return {
      data: userData,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    };
  }


  async updateUserAccess(
    id: string,
    block: boolean,
    reason?: string,
    // accessToken?: string,
  ): Promise<void> {
    const userDoc = await this._userRepository.findById(id);
    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const userUpdatedDoc = await this._userRepository.findByIdAndUpdate(id, {
      isBlocked: block,
      blockedReason: block === true ? reason : '',
    });

    if (!userUpdatedDoc) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // if (block && accessToken) {
    //   blacklistToken(accessToken);
    // }
  }

  async getCancellationRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<PaginatedData<PopulatedCancellationRequest>> {

    const result = await this._bookingRepository.getCancellationRequests(page, limit, status);

    return {
      data: result.requests.map((request) => ({
        ...request,
        _id: request._id.toString(),
      })),
      currentPage: page,
      totalPages: Math.ceil(result.total / limit),
      totalDocs: result.total,
    };
  }

  async getCancellationRequestDetails(bookingId: string): Promise<DetailedCancellationRequestResponseDTO> {
    const booking = await this._bookingRepository.getCancellationRequestById(bookingId);
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const mapped = BookingMapper.toCancellationRequestDetails(booking);

    let calculation = null;
    const policy = mapped.cancellationPolicy;

    if (policy && mapped.startDate && mapped.finalAmount) {
      calculation = computeRefundBreakdown(
        mapped.finalAmount,
        policy,
        new Date(mapped.startDate),
        mapped.cancelledAt || new Date()
      );
    }

    return {
      bookingId: mapped.bookingId,
      bookingCode:mapped.bookingCode,
      userName: mapped.userName,
      email: mapped.email,
      phoneNo: mapped.phoneNo,
      vendorName: mapped.vendorName,
      startDate: mapped.startDate,
      packageName: mapped.packageName,
      cancellationPolicyLabel: policy?.label || '',
      rules: policy?.rules || [],
      travelersCount: mapped.travelersCount,
      groupType: mapped.groupType,
      cancellationReason: mapped.cancellationReason,
      cancellationStatus: booking.cancellationStatus || CANCELATION_STATUS.PENDING,
      cancellationRejectedReason: mapped.cancellationRejectedReason,
      updatedAt: mapped.updatedAt,
      finalAmount: mapped.finalAmount,
      cancellationRefundAmount: mapped.cancellationRefundAmount,
      calculation,
    };
  }

  async rejectCancellationRequest(bookingId: string, userId: string, rejectedReason: string): Promise<void> {
    const booking = await this._bookingRepository.getCancellationRequestById(bookingId);

    if (!booking) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (booking.cancellationStatus !== CANCELATION_STATUS.PENDING) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST_ALREADY_PROCESSED, HTTP_STATUS.BAD_REQUEST);
    }

    const updatedBooking = await this._bookingRepository.findOneAndUpdateReject(bookingId,rejectedReason)

    if (!updatedBooking) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    try {
      await Promise.all([
        this._notificationService.createNotification({
          recipientId: booking.userId.toString(),
          recipientRole: USER_ROLES.USER,
          senderId: userId.toString(),
          notificationType: AdminNotificationType.RejectedCancellation,
          title: NOTIFICATION_TITLES.CANCELLATION_REJECETD,
          message: NOTIFICATION_MESSAGES.CANCELLATION_REJECTED(booking.packageId.title,rejectedReason),
          data: {
            bookingUId: booking._id.toString(),
            bookingId: booking.bookingCode,
            packageName: booking.packageId.title,
          },
          redirectUrl:REDIRECT_URL.USER_BOOKING_DETAILS(booking._id.toString()),
        }),

        this._notificationService.createNotification({
          recipientId: booking.vendorId.toString(),
          recipientRole: USER_ROLES.VENDOR,
          senderId: userId.toString(),
          notificationType: AdminNotificationType.RejectedCancellation,
          title: NOTIFICATION_TITLES.USER_CANCELLELATION_REJECETED,
          message: NOTIFICATION_MESSAGES.USER_CANCELLATION_REJECTED(booking.packageId.title,rejectedReason),
          data: {
            bookingUId: booking._id.toString(),
            bookingId: booking.bookingCode,
            scheduleId: booking.scheduleId.toString(),
            packageName: booking.packageId.title,
          },
          redirectUrl: REDIRECT_URL.USER_BOOKING_DETAILS(booking._id.toString()),
        }),
      ]);
    } catch (error) {
      logger.error({
        error,
      });
    }

  }

  async approveCancellationRequest(bookingId: string): Promise<void> {

    const session = await mongoose.startSession();
    session.startTransaction();
  
    try{
    const booking = await this._bookingRepository.findBookingWithSession(bookingId, session);

    if (!booking) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (booking.cancellationStatus !== CANCELATION_STATUS.PENDING && booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST_ALREADY_PROCESSED, HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await this._bookingRepository.updateBookingWithSession(bookingId, {
      cancellationStatus: CANCELATION_STATUS.APPROVED,
      bookingStatus: BOOKING_STATUS.CANCELLED_BY_USER,
    }, session);

    if (!updated) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }


    }catch(error){
      logger.error({
        error,
      });
      await session.abortTransaction();
      session.endSession();
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
