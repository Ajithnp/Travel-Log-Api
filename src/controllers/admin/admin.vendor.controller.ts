//Examples: approveVendor, rejectVendor, viewAllVendors, suspendVendor
import {inject, injectable} from 'tsyringe';
import { Request, Response, NextFunction } from "express";
import { IAdminVendorController } from "interfaces/controller_interfaces/admin/IAdminVendorController";
import { IAdminVendorService } from '../../interfaces/service_interfaces/admin/IAdminVendorService';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { VENDOR_STATUS } from 'shared/constants/common';


@injectable()
export class AdminVendorController implements IAdminVendorController{
    constructor (
        @inject('IAdminVendorService')
        private _adminVendorService: IAdminVendorService,
    ) {}

    async vendorVerificationRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.limit as string) || 10;

         try {
               const data = await this._adminVendorService.vendorVerificationRequestService(page, limit);
         
               const successResponse: IApiResponse<typeof data> = {
                 success: SUCCESS_STATUS.SUCCESS,
                 message: SUCCESS_MESSAGES.OK,
                 data: data,
               };
         
               res.status(HTTP_STATUS.OK).json(successResponse);
             } catch (error) {
               next(error);
             }
    }

    //=======================================================================
    async updateVendorverification(req: Request, res: Response, next: NextFunction): Promise<void> {
        
        const { vendorId } = req.params;
        const { status, reasonForReject } = req.body;

        try {
               await this._adminVendorService.updateVendorVerificationService(vendorId, {
               status,
               reasonForReject,
             });

             const successResponse: IApiResponse = {
                success: SUCCESS_STATUS.SUCCESS,
                message: status === VENDOR_STATUS.Approved ? SUCCESS_MESSAGES.VENDOR_VERIFICATION_SUCCESS
                : SUCCESS_MESSAGES.VENDOR_VERIFICATION_REJECTED
             }

          res.status(HTTP_STATUS.OK).json(successResponse);
        } catch (error) {
           next(error) 
        }
        
      
    }
    //===========================================================================
}