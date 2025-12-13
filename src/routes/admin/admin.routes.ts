import { inject, injectable } from 'tsyringe';
import BaseRoute from '../base.route';
import { IAdminUserController } from '../../interfaces/controller_interfaces/admin/IAdminUserController';
import { IAdminVendorController } from '../../interfaces/controller_interfaces/admin/IAdminVendorController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import { BlockOrUnblockUserSchema } from '../../types/dtos/admin/user/request.dtos';
import { UpdateVendorVerificationSchema } from '../../types/dtos/admin/vendor/request.dtos';
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

    this._router.patch(
      '/users/:userId/status',
      validateDTO(BlockOrUnblockUserSchema),
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),

      this._adminUserContoller.blockOrUnblockUser.bind(this._adminUserContoller),
    );

    //========== vendor management ==================

    this._router.get(
      '/vendor/verification-requests',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.vendorVerificationRequest.bind(this._adminVendorController),
    );

    this._router.patch(
      '/update-vendor-verification/:vendorId',
      validateDTO(UpdateVendorVerificationSchema),
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.updateVendorVerification.bind(this._adminVendorController),
    );

    this._router.get(
      '/vendors',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.getVendors.bind(this._adminVendorController),
    );
  }
}
