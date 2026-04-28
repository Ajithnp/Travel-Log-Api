import { inject, injectable } from 'tsyringe';
import { IBookingController } from '../../interfaces/controller_interfaces/user/IBookingController';
import {
  ConfirmBookingResponseDTO,
  IBookingService,
  InitiateBookingDTO,
  InitiateBookingResponseDTO,
} from '../../interfaces/service_interfaces/user/IBookingService';
import expressAsyncHandler from 'express-async-handler';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
@injectable()
export class BookingController implements IBookingController {
  constructor(
    @inject('IBookingService')
    private _bookingService: IBookingService,
  ) {}

  initiateBooking = expressAsyncHandler(async (req, res) => {
    console.log('Initiate booking request received');

    const userId = req.user!.id;
    console.log('User ID:', userId);
    console.log('request body:', req.body);
    const { packageId, scheduleId, tierType, seatsCount, travelers, amountInPaise } = req.body;
    console.log('request body:', req.body);

    const payload: InitiateBookingDTO = {
      userId,
      packageId,
      scheduleId,
      tierType,
      seatsCount,
      travelers,
      amountInPaise,
    };

    console.log('Initiate booking payload:', payload);

    const result = await this._bookingService.initiateBooking(payload);

    const response: IApiResponse<InitiateBookingResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.SEATS_HELD_SUCCESS,
      data: result,
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  });

  confirmBooking = expressAsyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { reservationId, stripePaymentIntentId } = req.body;

    const result = await this._bookingService.confirmBooking({
      userId,
      bookingId: reservationId,
      stripePaymentIntentId,
    });

    const response: IApiResponse<ConfirmBookingResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.BOOKING_CONFIRMED,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(response);
  });
}
