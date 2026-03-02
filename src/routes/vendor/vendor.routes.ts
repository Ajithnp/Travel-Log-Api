import { inject, injectable } from 'tsyringe';
import upload from '../../middlewares/multer';
import BaseRoute from '../base.route';
import { IVendorController } from '../../interfaces/controller_interfaces/vendor/IVendorController';
import { IVendorPackageController } from '../../interfaces/controller_interfaces/vendor/IVendorPackageController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import {
  UpdateProfileLogoRequestSchema,
  VendorVerificationSchema,
  updateProfileLogoSchema,
} from '../../types/dtos/vendor/request.dtos';
import { PackageCreateUnionSchema } from '../../validators/vendor/package/base-package.schema';
import { IVendorCategoryController } from '../../interfaces/controller_interfaces/vendor/IVendorCategoryController';
import { getRequestedCategorySchema } from 'validators/vendor/category.validation';
@injectable()
export class VendorRoutes extends BaseRoute {
  constructor(
    @inject('IVendorController')
    private _vendorController: IVendorController,
    @inject('IVendorPackageController')
    private _vendorPackageController: IVendorPackageController,
    @inject('IVendorCategoryController')
    private _vendorCategoryController: IVendorCategoryController,
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
      validateDTO(UpdateProfileLogoRequestSchema),
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
    /*---------------Package management--------------------- */
    this._router.post(
      '/packages',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(PackageCreateUnionSchema),
      this._vendorPackageController.createPackage.bind(this._vendorPackageController),
    );

    this._router.put(
      '/packages/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(PackageCreateUnionSchema),
      this._vendorPackageController.updatePackage.bind(this._vendorPackageController),
    );

    this._router.get(
      '/packages',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.fetchPackages.bind(this._vendorPackageController),
    );

    this._router.get(
      '/packages/:id',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._vendorPackageController.fetPackagesWithId.bind(this._vendorPackageController),
    );

    //======================category mgnt===================
    
    this._router.get(
      '/category/request',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      validateDTO(getRequestedCategorySchema),
      this._vendorCategoryController.getVendorsRequestCategories.bind(this._vendorPackageController),
    );
  }
}
