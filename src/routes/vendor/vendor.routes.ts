import { inject, injectable } from 'tsyringe';
import upload from '../../middlewares/multer';
import BaseRoute from '../base.route';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import {
  VendorVerificationSchema,
  updateProfileLogoSchema,
} from '../../types/dtos/vendor/request.dtos';
@injectable()
export class VendorRoutes extends BaseRoute {
  constructor(
    @inject('IVendorController')
    private _vendorController: IVendorController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.get(
      '/me',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorController.profile.bind(this._vendorController),
    );

    this._router.patch(
      '/me/profileLogo',
      validateDTO(updateProfileLogoSchema),
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorController.updateProfileLogo.bind(this._vendorController),
    );

    this._router.post(
      '/verification',
      validateDTO(VendorVerificationSchema),
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),

      this._vendorController.vendorVerificationSubmit.bind(this._vendorController),
    );
  }
}
