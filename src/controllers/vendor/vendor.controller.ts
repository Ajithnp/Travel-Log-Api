import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';
import { VendorVerificationDTO,VendorVerificationSchema } from '../../validators/vendor.verification.schema';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { getFile } from '../../shared/utils/multer.helper';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { IApiResponse } from 'types/common/IApiResponse';
import { SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { IVendorVerificationResponseDTO } from '../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { USER_ROLES } from '../../shared/constants/roles';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
@injectable()
export class VendorController implements IVendorController {
  constructor(
    @inject('IVendorService')
    private _vendorService: IVendorService,
  ) {}

  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== USER_ROLES.VENDOR) {
        throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
      }
      
      const doc = await this._vendorService.profile(req.user.id);
      
      const successResponse: IApiResponse<VendorProfileResponseDTO> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: doc,
      };

      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
      next(error);
    }
  }
  //=====================================================================================
  async vendorVerificationSubmit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = VendorVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
    }

    const files = {
      businessLicence: getFile(req, 'businessLicence'),
      businessPan: getFile(req, 'businessPan'),
      companyLogo: getFile(req, 'companyLogo'),
      ownerIdentity: getFile(req, 'ownerIdentityProof'),
    };

    if (!req.user || !req.user.id) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
    }

    const textData: VendorVerificationDTO = parsed.data;
    if (!files.businessLicence || !files.businessPan || !files.companyLogo) {
      throw new AppError(
        ERROR_MESSAGES.MISSING_REQUIRED_FIELDS_FOR_VERIFICATION,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    try {
      const result = await this._vendorService.vendorVerificationSubmit(
        req.user.id,
        textData,
        files,
      );

      const successResponse: IApiResponse<IVendorVerificationResponseDTO> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
        data: {
          isProfileVerified: result.isProfileVerified,
        },
      };
      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
      next(error);
    }
  }

  //===========================================================================
}
