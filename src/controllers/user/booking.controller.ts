import { inject, injectable } from 'tsyringe';
import { IBookingController } from '../../interfaces/controller_interfaces/user/IBookingController';
import {
  ConfirmBookingResponseDTO,
  IBookingService,
  InitiateBookingDTO,
  InitiateBookingResponseDTO,
  VerifyPaymentResponseDTO,
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
   
    const userId = req.user!.id;
    const { packageId, scheduleId, tierType, seatsCount, travelers, amountInPaise } = req.body;
  
    const payload: InitiateBookingDTO = {
      userId,
      packageId,
      scheduleId,
      tierType,
      seatsCount,
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

  verifyPayment = expressAsyncHandler(async (req, res) => {
    const { session_id } = req.query as { session_id: string };

    const result = await this._bookingService.verifyPayment(session_id);

    const response: IApiResponse<VerifyPaymentResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: result.status === 'success' ? SUCCESS_MESSAGES.PAYMENT_VERIFIED : SUCCESS_MESSAGES.PAYMENT_VERIFICATION_FAILED,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(response);
  })

}
