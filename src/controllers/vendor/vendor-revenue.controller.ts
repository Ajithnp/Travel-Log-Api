import { inject, injectable } from 'tsyringe';
import { IVendorRevenueController } from '../../interfaces/controller_interfaces/vendor/IVendorRevenueController';
import { IVendorRevenueService } from '../../interfaces/service_interfaces/vendor/IVendorRevenueService';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';

@injectable()
export class VendorRevenueController implements IVendorRevenueController {
  constructor(
    @inject('IVendorRevenueService')
    private _vendorRevenueService: IVendorRevenueService,
  ) {}

    packagesEarningOverview = expressAsyncHandler(async (req:Request, res:Response):Promise<void> => {
      const vendorId = req.user?.id;
      const { page, limit, search } = getPaginationOptions(req);
 
      const result = await this._vendorRevenueService.packagesEarningOverview(vendorId, page, limit, search);
  
      const successResponse: IApiResponse<typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: result,
      };
  
      res.status(HTTP_STATUS.OK).json(successResponse);
    });
}
