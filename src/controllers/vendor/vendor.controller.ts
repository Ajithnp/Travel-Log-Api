import asyncHandler from "express-async-handler";
import { inject, injectable } from 'tsyringe';
import { Request, Response} from 'express';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';

import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { IApiResponse } from 'types/common/IApiResponse';
import { SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { IVendorVerificationResponseDTO } from '../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
@injectable()
export class VendorController implements IVendorController {
  constructor(
    @inject('IVendorService')
    private _vendorService: IVendorService,
  ) {}

profile = asyncHandler(
  async (req, res) => {

    const vendor = await this._vendorService.profile(req.user!.id);
  
    const successResponse: IApiResponse<VendorProfileResponseDTO> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: vendor,
    };
    
   res.status(HTTP_STATUS.OK).json(successResponse);
  }
);
  //====================================================================================
  updateProfileLogo = asyncHandler(
    async (req, res): Promise<void> => {
      
    const { files , vendorInfoId} = req.body 

    await this._vendorService.updateProfileLogo(req.user!.id, { files, vendorInfoId });

    const successResponse: IApiResponse<VendorProfileResponseDTO> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
      };
    res.status(HTTP_STATUS.OK).json(successResponse);
  }
);
  //=====================================================================================
vendorVerificationSubmit = asyncHandler(
  async (req, res) => {
  
    const payload = req.body;

    const result = await this._vendorService.vendorVerificationSubmit(
      req.user!.id,
      payload
    );

  const successResponse: IApiResponse<IVendorVerificationResponseDTO> = {
    success: SUCCESS_STATUS.SUCCESS,
    message: SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
    data: {
        isProfileVerified: result.isProfileVerified,
      },
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  }
);

  //===========================================================================
}
