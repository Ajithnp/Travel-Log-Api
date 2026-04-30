import { inject, injectable } from "tsyringe";
import { IAdminCancellationPolicyController } from "../../interfaces/controller_interfaces/admin/IAdminCancellationPolicyController";
import { ICancellationPolicyService } from "../../interfaces/service_interfaces/admin/ICancellationPolicyService";
import expressAsyncHandler from "express-async-handler";
import { IApiResponse } from "../../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../../shared/constants/messages";
import { CreateCancellationPolicyDto } from "types/dtos/admin/cancellation-policy.dtos";
@injectable()
export class AdminCancellationPolicyController implements IAdminCancellationPolicyController { 
   
    constructor(
        @inject('ICancellationPolicyService')
        private _policyService: ICancellationPolicyService
    ) { }

     createPolicy = expressAsyncHandler(async (req, res) => {
        const payload: CreateCancellationPolicyDto = req.body;
        const data = await this._policyService.createPolicy(payload);
    
        const successResponse: IApiResponse<typeof data> = {
          success: SUCCESS_STATUS.SUCCESS,
          message: SUCCESS_MESSAGES.OK,
          data,
        };
    
        res.status(HTTP_STATUS.CREATED).json(successResponse);
     });
    
    getPolicies = expressAsyncHandler(async (req, res) => {
        const data = await this._policyService.getPolicies();

        const successResponse: IApiResponse<typeof data> = {
          success: SUCCESS_STATUS.SUCCESS,
          message: SUCCESS_MESSAGES.OK,
          data,
        };

        res.status(HTTP_STATUS.OK).json(successResponse);
      });
}
    
    
      
