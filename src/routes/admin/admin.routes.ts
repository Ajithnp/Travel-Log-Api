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
import { IAdminCategoryController } from '../../interfaces/controller_interfaces/admin/IAdminCategoryController';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../../validators/admin/category.validation';
@injectable()
export class AdminRoutes extends BaseRoute {
  constructor(
    @inject('IAdminUserController')
    private _adminUserContoller: IAdminUserController,
    @inject('IAdminVendorController')
    private _adminVendorController: IAdminVendorController,
    @inject('IAdminCategoryController')
    private _adminCategoryController: IAdminCategoryController,
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
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(BlockOrUnblockUserSchema),
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
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(UpdateVendorVerificationSchema),
      this._adminVendorController.updateVendorVerification.bind(this._adminVendorController),
    );

    this._router.get(
      '/vendors',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.getVendors.bind(this._adminVendorController),
    );

    // =================Category management===================
    this._router.post(
      '/category',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(createCategorySchema),
      this._adminCategoryController.createCategory.bind(this._adminCategoryController),
    );

    this._router.put(
      '/category/:id',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(updateCategorySchema),
      this._adminCategoryController.updateCategory.bind(this._adminCategoryController),
    );

    this._router.patch(
      '/category/:id/toggle',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminCategoryController.toggleCategoryStatus.bind(this._adminCategoryController),
    );

    this._router.get(
      '/category',
      // isAuthenticated,
      // authorize([USER_ROLES.ADMIN]),
      this._adminCategoryController.getAllCategories.bind(this._adminCategoryController),
    );
  }
}
