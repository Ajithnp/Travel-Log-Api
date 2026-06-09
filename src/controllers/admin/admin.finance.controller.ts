import { inject, injectable } from 'tsyringe';
import { IAdminFinanceController } from '../../interfaces/controller_interfaces/admin/IAdminFinanceController';
import { IAdminFinanceService } from '../../interfaces/service_interfaces/admin/IAdminFinanceService';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS} from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';

@injectable()
export class AdminFinanceController implements IAdminFinanceController {
  constructor(
    @inject('IAdminFinanceService')
    private _adminFinanceService: IAdminFinanceService,
  ) {}

    getCommissionOverview = expressAsyncHandler(async (req:Request, res:Response):Promise<void> => {
 
     const result = await this._adminFinanceService.getCommissionOverview();
  
      const successResponse: IApiResponse <typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data:result,
      };
  
      res.status(HTTP_STATUS.OK).json(successResponse);
    });


    getCommissionsByVendors = expressAsyncHandler(async (req:Request, res:Response):Promise<void> => {
     
      const {page,limit,search}=getPaginationOptions(req);
      const result = await this._adminFinanceService.getCommissionsByVendors(page,limit,search);

      const successResponse: IApiResponse <typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data:result,
      };
  
      res.status(HTTP_STATUS.OK).json(successResponse);
    });
  
}
