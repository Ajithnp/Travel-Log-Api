import { Request, Response, NextFunction } from 'express';
import { IVendorController } from '../../interfaces/controller_interfaces/IVendorController';
import {
  VendorVerificationDTO,
  VendorVerificationSchema,
} from 'validators/vendor.verification.schema';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { getFile } from '../../shared/utils/multer.helper';

export class VendorController implements IVendorController {
  constructor() {}

  vendorVerificationSubmit(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    try {
      const result = null; // this._vendorService(req.user.id, textData, files)
    } catch (error) {
      next(error);
    }
  }

  //===========================================================================
}
