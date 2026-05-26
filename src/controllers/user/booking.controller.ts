import { inject, injectable } from 'tsyringe';
import { IBookingController } from '../../interfaces/controller_interfaces/user/IBookingController';
import {
  CancelBookingDTO,
  CancelBookingResponseDTO,
  ConfirmBookingDTO,
  ConfirmBookingResponseDTO,
  GetBookingsDTO,
  IBookingService,
  InitiateBookingDTO,
  InitiateBookingResponseDTO,
  RetryBookingPaymentDTO,
  VerifyPaymentResponseDTO,
} from '../../interfaces/service_interfaces/user/IBookingService';
import expressAsyncHandler from 'express-async-handler';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import { BookingStatus } from '../../types/entities/booking.entity';
@injectable()
export class BookingController implements IBookingController {
  constructor(
    @inject('IBookingService')
    private _bookingService: IBookingService,
  ) {}

  initiateBooking = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { packageId, scheduleId, tierType, seatsCount, travelers, useWallet, amountInPaise } =
      req.body;

    const payload: InitiateBookingDTO = {
      userId,
      packageId,
      scheduleId,
      tierType,
      seatsCount,
      useWallet,
      travelers,
      amountInPaise,
    };

    const result = await this._bookingService.initiateBooking(payload);

    const response: IApiResponse<InitiateBookingResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.SEATS_HELD_SUCCESS,
      data: result,
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  });

  confirmBookingWallet = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookingId } = req.params as { bookingId: string };

    const payload: ConfirmBookingDTO = {
      userId,
      bookingId,
    };

    const result = await this._bookingService.confirmBooking(payload);

    const response: IApiResponse<ConfirmBookingResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(response);
  });

  verifyPayment = expressAsyncHandler(async (req, res) => {
    const { session_id } = req.query as { session_id: string };

    const result = await this._bookingService.verifyPayment(session_id);

    const response: IApiResponse<VerifyPaymentResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message:
        result.status === 'success'
          ? SUCCESS_MESSAGES.PAYMENT_VERIFIED
          : SUCCESS_MESSAGES.PAYMENT_VERIFICATION_FAILED,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(response);
  });

  retryBookingPayment = expressAsyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bookingId } = req.params as { bookingId: string };

    const payload: RetryBookingPaymentDTO = {
      userId,
      bookingId,
    };

    const result = await this._bookingService.retryBookingPayment(payload);

    const response: IApiResponse<InitiateBookingResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(response);
  });

  getBookings = expressAsyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const { search, page, limit, selectedFilter } = getPaginationOptions(req);
    const payload: GetBookingsDTO = {
      search,
      page,
      limit,
      bookingStatus: selectedFilter as BookingStatus,
    };

    const result = await this._bookingService.getBookings(userId, payload);
    const response: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(response);
  });

  getBookingDetails = expressAsyncHandler(async (req, res) => {
    const { bookingId } = req.params as { bookingId: string };
    const userId = req.user.id;

    const result = await this._bookingService.getBookingDetails(userId, bookingId);

    const response: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(response);
  });

  cancelBookingRequest = expressAsyncHandler(async (req, res) => {
    const { bookingId } = req.params as { bookingId: string };
    const userId = req.user!.id;
    const { reason, details } = req.body;

    const payload: CancelBookingDTO = {
      userId,
      bookingId,
      reason,
      details,
    };

    const result = await this._bookingService.cancelBookingRequest(payload);

    const response: IApiResponse<CancelBookingResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.BOOKING_CANCELLED,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(response);
  });
}
