import { inject, injectable } from 'tsyringe';
import upload from '../../middlewares/multer';
import { BaseRoute } from '../../routes/base.routes';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
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

    this._router.post(
      '/verification',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      upload.fields([
        { name: 'businessLicence', maxCount: 1 },
        { name: 'businessPan', maxCount: 1 },
        { name: 'companyLogo', maxCount: 1 },
        { name: 'ownerIdentityProof', maxCount: 1 },
      ]),
      this._vendorController.vendorVerificationSubmit.bind(this._vendorController),
    );
  }
}
