import { inject, injectable } from 'tsyringe';
import { BaseRoute } from '../../routes/base.routes';
import { IAdminUserController } from '../../interfaces/controller_interfaces/admin/IAdminUserController';
import { IAdminVendorController } from '../../interfaces/controller_interfaces/admin/IAdminVendorController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
@injectable()
export class AdminRoutes extends BaseRoute {
  constructor(
    @inject('IAdminUserController')
    private _adminUserContoller: IAdminUserController,
    @inject('IAdminVendorController')
    private _adminVendorController: IAdminVendorController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    //============ user management ====================
    this._router.get(
      '/users',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminUserContoller.getAllUsers.bind(this._adminUserContoller),
    );

    this.router.patch(
      '/users/:userId/status',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),

      this._adminUserContoller.blockOrUnclockUser.bind(this._adminUserContoller),
    );

    //========== vendor management ==================

    this.router.get(
      '/vendor/verification-requests',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.vendorVerificationRequest.bind(this._adminVendorController),
    );

    this.router.patch(
      '/update-vendor-verification/:vendorId',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.updateVendorverification.bind(this._adminVendorController),
    );

    this._router.get(
      '/vendors',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.getVendors.bind(this._adminVendorController),
    );

    this.router.patch(
      '/vendors/:vendorId/status',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.blockOrUnclockVendor.bind(this._adminVendorController),
    );
  }
}
