import { inject, injectable } from 'tsyringe';
import BaseRoute from '../base.route';
import { IAdminUserController } from '../../interfaces/controller_interfaces/admin/IAdminUserController';
import { IAdminVendorController } from '../../interfaces/controller_interfaces/admin/IAdminVendorController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import {
  BlockOrUnblockUserSchema,
  CancellationRejectSchema,
} from '../../types/dtos/admin/user/request.dtos';
import { UpdateVendorVerificationSchema } from '../../types/dtos/admin/vendor/request.dtos';
import { IAdminCategoryController } from '../../interfaces/controller_interfaces/admin/IAdminCategoryController';
import { IAdminCancellationPolicyController } from '../../interfaces/controller_interfaces/admin/IAdminCancellationPolicyController';
import { IAdminVendorPackageOversightController } from '../../interfaces/controller_interfaces/admin/IAdminVendorPackageController';
import {
  createCategorySchema,
  reviewCategorySchema,
  reviewedCategorySchema,
  updateCategorySchema,
} from '../../validators/category.validation';
import {
  CancellationPolicyRequestSchema,
  PolicyStatusRequestSchema,
} from '../../types/dtos/admin/cancellation-policy.dtos';
import { couponTemplateRequestSchema } from '../../validators/coupon.validation';
import { ICouponController } from '../../interfaces/controller_interfaces/ICouponController';

@injectable()
export class AdminRoutes extends BaseRoute {
  constructor(
    @inject('IAdminUserController')
    private _adminUserContoller: IAdminUserController,
    @inject('IAdminVendorController')
    private _adminVendorController: IAdminVendorController,
    @inject('IAdminCategoryController')
    private _adminCategoryController: IAdminCategoryController,
    @inject('IAdminCancellationPolicyController')
    private _adminCancellationPolicyController: IAdminCancellationPolicyController,
    @inject('IAdminVendorPackageOversightController')
    private _adminVendorPackageController: IAdminVendorPackageOversightController,
    @inject('ICouponController')
    private _couponController: ICouponController,
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

    this._router.get(
      '/users/cancellation-requests',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminUserContoller.getCancellationRequests.bind(this._adminUserContoller),
    );

    this._router.get(
      '/users/cancellation-requests/:bookingId',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminUserContoller.getCancellationRequestDetails.bind(this._adminUserContoller),
    );

    this._router.patch(
      '/users/cancellation-requests/:bookingId/reject',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(CancellationRejectSchema),
      this._adminUserContoller.rejectCancellationRequest.bind(this._adminUserContoller),
    );

    this._router.patch(
      '/users/cancellation-requests/:bookingId/approve',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminUserContoller.approveCancellationRequest.bind(this._adminUserContoller),
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

    this._router.get(
      '/vendors/:vendorId',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.getVendorProfile.bind(this._adminVendorController),
    );

    this._router.get(
      '/vendors/:vendorId/stats',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorController.getVendorProfileStats.bind(this._adminVendorController),
    );

    // =================Package oversight===================
    this._router.get(
      '/vendor/packages',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorPackageController.getPackages.bind(this._adminVendorPackageController),
    );

    this._router.get(
      '/vendor/packages/:packageId',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorPackageController.getPackageDetails.bind(this._adminVendorPackageController),
    );

    this._router.get(
      '/vendor/packages/:packageId/schedules',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorPackageController.getPackageSchedules.bind(
        this._adminVendorPackageController,
      ),
    );

    this._router.get(
      '/vendor/schedules/stats',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorPackageController.getPackageScheduleStats.bind(
        this._adminVendorPackageController,
      ),
    );

    this._router.get(
      '/vendor/schedules',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminVendorPackageController.getSchedules.bind(this._adminVendorPackageController),
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
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminCategoryController.getAllCategories.bind(this._adminCategoryController),
    );

    this._router.get(
      '/category/requests',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._adminCategoryController.getPendingRequest.bind(this._adminCategoryController),
    );

    this._router.patch(
      '/category/requests/:id/review',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(reviewCategorySchema),
      this._adminCategoryController.reviewCategoryRequest.bind(this._adminCategoryController),
    );

    this._router.get(
      '/category/requests/reviewed',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(reviewedCategorySchema),
      this._adminCategoryController.getReviwedRequest.bind(this._adminCategoryController),
    );

    // ================ Cancellation Policy Management ===================
    this._router.post(
      '/cancellation-policies',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(CancellationPolicyRequestSchema),
      this._adminCancellationPolicyController.createPolicy.bind(
        this._adminCancellationPolicyController,
      ),
    );

    this._router.get(
      '/cancellation-policies',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN, USER_ROLES.VENDOR]),
      this._adminCancellationPolicyController.getPolicies.bind(
        this._adminCancellationPolicyController,
      ),
    );

    this._router.patch(
      '/cancellation-policies/:policyId',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(PolicyStatusRequestSchema),
      this._adminCancellationPolicyController.togglePolicyActiveStatus.bind(
        this._adminCancellationPolicyController,
      ),
    );

    this._router.post(
      '/coupons',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      validateDTO(couponTemplateRequestSchema),
      this._couponController.createCoupon.bind(this._couponController),
    );

    this._router.get(
      '/coupons',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._couponController.getAllCoupons.bind(this._couponController),
    );

    this._router.patch(
      '/coupons/:couponId/deactivate',
      isAuthenticated,
      authorize([USER_ROLES.ADMIN]),
      this._couponController.deActivateCoupon.bind(this._couponController),
    );
  }
}
