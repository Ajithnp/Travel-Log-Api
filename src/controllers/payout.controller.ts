import { inject, injectable } from 'tsyringe';
import { IPayoutController } from '../interfaces/controller_interfaces/IPayoutContoller';
import { IPayoutService } from '../interfaces/service_interfaces/IPayoutService';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { IApiResponse } from '../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import { getPaginationOptions } from '../shared/utils/pagination.helper';
import { PayoutFilter } from 'interfaces/repository_interfaces/IPayoutRepository';

@injectable()
export class PayoutController implements IPayoutController {
  constructor(
    @inject('IPayoutService')
    private _payoutService: IPayoutService,
  ) {}

  getPayoutSchedules = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search } = getPaginationOptions(req);

    const result = await this._payoutService.getPayoutSchedules(page, limit, search);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  payoutOverview = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this._payoutService.payoutOverview();

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  schedulePayoutDetails = expressAsyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { scheduleId } = req.params as { scheduleId: string };

      const result = await this._payoutService.schedulePayoutDetails(scheduleId);

      const successResponse: IApiResponse<typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: result,
      };

      res.status(HTTP_STATUS.OK).json(successResponse);
    },
  );

  releasePayout = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { scheduleId } = req.params as { scheduleId: string };

    const result = await this._payoutService.releasePayout(scheduleId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PAYOUT_RELEASED_SUCCESSFULLY,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  retryPayout = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { payoutId } = req.params as { payoutId: string };

    const result = await this._payoutService.retryPayout(payoutId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PAYOUT_RELEASED_SUCCESSFULLY,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  payoutStats = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this._payoutService.payoutStats();

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  findAllPayouts = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search } = getPaginationOptions(req);
    const { filter } = req.query as { filter: PayoutFilter };

    const result = await this._payoutService.findAllPayouts(page, limit, search, filter);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  findAllVendorPayouts = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search } = getPaginationOptions(req);
    const { filter } = req.query as { filter: PayoutFilter };
    const vendorId = req?.user?.id;

    const result = await this._payoutService.findAllVendorPayouts(
      vendorId,
      page,
      limit,
      search,
      filter,
    );

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
