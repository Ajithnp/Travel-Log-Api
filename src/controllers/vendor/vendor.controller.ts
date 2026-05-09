import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { IApiResponse } from '../../types/common/IApiResponse';
import { SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { IVendorVerificationResponseDTO } from '../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
import { VendorVerificationRequestDTO } from '../../types/dtos/vendor/request.dtos';
import { IVendorVerificationResponse, IVendorVerificationService } from '../../interfaces/service_interfaces/vendor/IvendorVerificationService';
@injectable()
export class VendorController implements IVendorController {
  constructor(
    @inject('IVendorService')
    private _vendorService: IVendorService,
    @inject('IVendorVerificationService')
    private _vendorVerificationService: IVendorVerificationService,
  ) {}

  profile = asyncHandler(async (req, res) => {
    const vendor = await this._vendorService.profile(req.user!.id);

    const successResponse: IApiResponse<VendorProfileResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: vendor,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
  //====================================================================================
  updateProfileLogo = asyncHandler(async (req, res): Promise<void> => {
    const { files, vendorInfoId } = req.body;

    await this._vendorService.updateProfileLogo(req.user!.id, { files, vendorInfoId });

    const successResponse: IApiResponse<VendorProfileResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
  //=====================================================================================
  vendorVerificationSubmit = asyncHandler(async (req, res) => {
    const payload: VendorVerificationRequestDTO = req.body;

    const result = await this._vendorVerificationService.vendorVerificationSubmit(req.user!.id, payload);

    const successResponse: IApiResponse<IVendorVerificationResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
      data: {
        isProfileVerified: result.isProfileVerified,
      },
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  //===========================================================================

  getRejectedVendor = asyncHandler(async (req, res) => {
    const vendorId = req.params.vendorId;

    const result = await this._vendorVerificationService.getRejectedVendor(vendorId);

    const successResponse: IApiResponse<IVendorVerificationResponse> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
      data:result
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  vendorVerificationReapply = asyncHandler(async (req, res) => {
    const { vendorInfoId } = req.params;
    
    const result = await this._vendorVerificationService.vendorVerificationReapply(req.user!.id, vendorInfoId, req.body as VendorVerificationRequestDTO);

    const successResponse: IApiResponse<IVendorVerificationResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
      data: result
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

}
