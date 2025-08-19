import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IVendorController } from '../../interfaces/controller_interfaces/IVendorController';
import {
  VendorVerificationDTO,
  VendorVerificationSchema,
} from 'validators/vendor.verification.schema';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { getFile } from '../../shared/utils/multer.helper';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { IApiResponse } from 'types/common/IApiResponse';
import { SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { IVendorVerificationResponseDTO } from '../../dtos/vendor/vendor.verification.response.dtos';

@injectable()
export class VendorController implements IVendorController {
  constructor(
    @inject("IVendorService")
    private _vendorRepository: IVendorService,
  ) {}

  async  vendorVerificationSubmit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = VendorVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
    }
    // collect files
    const files = {
      businessLicence: getFile(req,"businessLicence"),
      businessPan: getFile(req, "businessPan"),
      companyLogo: getFile(req, "companyLogo")
    };
    const textData: VendorVerificationDTO = parsed.data;

     // just Ensure files are present before proceeding 
      if (!files.businessLicence || !files.businessPan || !files.companyLogo) {
          throw new AppError(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS_FOR_VERIFICATION, HTTP_STATUS.BAD_REQUEST);
      }
    try {
      const result = await this._vendorRepository.vendorVerificationSubmitService(
        req.user.id,
        textData,
        files
      ); 

      const successResponse: IApiResponse<IVendorVerificationResponseDTO> = {
              success: SUCCESS_STATUS.SUCCESS,
              message: SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
              data : {
                isProfileVerified: result.isProfileVerified
              }
            };
         res.status(HTTP_STATUS.OK).json(successResponse)   
    } catch (error) {
      next(error);
    }
  }

  //===========================================================================
}
