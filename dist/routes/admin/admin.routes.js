"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const tsyringe_1 = require("tsyringe");
const base_route_1 = __importDefault(require("../base.route"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const roles_1 = require("../../shared/constants/roles");
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const request_dtos_1 = require("../../types/dtos/admin/user/request.dtos");
const request_dtos_2 = require("../../types/dtos/admin/vendor/request.dtos");
const category_validation_1 = require("../../validators/category.validation");
const cancellation_policy_dtos_1 = require("../../types/dtos/admin/cancellation-policy.dtos");
const coupon_validation_1 = require("../../validators/coupon.validation");
let AdminRoutes = class AdminRoutes extends base_route_1.default {
    constructor(_adminController, _adminUserContoller, _adminVendorController, _adminCategoryController, _adminCancellationPolicyController, _adminVendorPackageController, _couponController, _adminFinanceController, _payoutController, _contactController) {
        super();
        this._adminController = _adminController;
        this._adminUserContoller = _adminUserContoller;
        this._adminVendorController = _adminVendorController;
        this._adminCategoryController = _adminCategoryController;
        this._adminCancellationPolicyController = _adminCancellationPolicyController;
        this._adminVendorPackageController = _adminVendorPackageController;
        this._couponController = _couponController;
        this._adminFinanceController = _adminFinanceController;
        this._payoutController = _payoutController;
        this._contactController = _contactController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        //============ user management ====================
        this._router.get('/users', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminUserContoller.getAllUsers.bind(this._adminUserContoller));
        this._router.get('/users/cancellation-requests', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminUserContoller.getCancellationRequests.bind(this._adminUserContoller));
        this._router.get('/users/cancellation-requests/:bookingId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminUserContoller.getCancellationRequestDetails.bind(this._adminUserContoller));
        this._router.patch('/users/cancellation-requests/:bookingId/reject', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.CancellationRejectSchema), this._adminUserContoller.rejectCancellationRequest.bind(this._adminUserContoller));
        this._router.patch('/users/cancellation-requests/:bookingId/approve', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminUserContoller.approveCancellationRequest.bind(this._adminUserContoller));
        this._router.patch('/users/:userId/status', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.BlockOrUnblockUserSchema), this._adminUserContoller.blockOrUnblockUser.bind(this._adminUserContoller));
        //========== vendor management ==================
        this._router.get('/vendor/verification-requests', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorController.vendorVerificationRequest.bind(this._adminVendorController));
        this._router.patch('/update-vendor-verification/:vendorId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(request_dtos_2.UpdateVendorVerificationSchema), this._adminVendorController.updateVendorVerification.bind(this._adminVendorController));
        this._router.get('/vendors', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorController.getVendors.bind(this._adminVendorController));
        this._router.get('/vendors/:vendorId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorController.getVendorProfile.bind(this._adminVendorController));
        this._router.get('/vendors/:vendorId/stats', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorController.getVendorProfileStats.bind(this._adminVendorController));
        // =================Package oversight===================
        this._router.get('/vendor/packages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorPackageController.getPackages.bind(this._adminVendorPackageController));
        this._router.get('/vendor/packages/:packageId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorPackageController.getPackageDetails.bind(this._adminVendorPackageController));
        this._router.get('/vendor/packages/:packageId/schedules', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorPackageController.getPackageSchedules.bind(this._adminVendorPackageController));
        this._router.get('/vendor/schedules/stats', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorPackageController.getPackageScheduleStats.bind(this._adminVendorPackageController));
        this._router.get('/vendor/schedules', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminVendorPackageController.getSchedules.bind(this._adminVendorPackageController));
        // =================Category management===================
        this._router.post('/category', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(category_validation_1.createCategorySchema), this._adminCategoryController.createCategory.bind(this._adminCategoryController));
        this._router.put('/category/:id', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(category_validation_1.updateCategorySchema), this._adminCategoryController.updateCategory.bind(this._adminCategoryController));
        this._router.patch('/category/:id/toggle', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminCategoryController.toggleCategoryStatus.bind(this._adminCategoryController));
        this._router.get('/category', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminCategoryController.getAllCategories.bind(this._adminCategoryController));
        this._router.get('/category/requests', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminCategoryController.getPendingRequest.bind(this._adminCategoryController));
        this._router.patch('/category/requests/:id/review', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(category_validation_1.reviewCategorySchema), this._adminCategoryController.reviewCategoryRequest.bind(this._adminCategoryController));
        this._router.get('/category/requests/reviewed', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(category_validation_1.reviewedCategorySchema), this._adminCategoryController.getReviwedRequest.bind(this._adminCategoryController));
        // ================ Cancellation Policy Management ===================
        this._router.post('/cancellation-policies', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(cancellation_policy_dtos_1.CancellationPolicyRequestSchema), this._adminCancellationPolicyController.createPolicy.bind(this._adminCancellationPolicyController));
        this._router.get('/cancellation-policies', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN, roles_1.USER_ROLES.VENDOR]), this._adminCancellationPolicyController.getPolicies.bind(this._adminCancellationPolicyController));
        this._router.patch('/cancellation-policies/:policyId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(cancellation_policy_dtos_1.PolicyStatusRequestSchema), this._adminCancellationPolicyController.togglePolicyActiveStatus.bind(this._adminCancellationPolicyController));
        this._router.post('/coupons', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), (0, validate_dto_middleware_1.validateDTO)(coupon_validation_1.couponTemplateRequestSchema), this._couponController.createCoupon.bind(this._couponController));
        this._router.get('/coupons', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._couponController.getAllCoupons.bind(this._couponController));
        this._router.patch('/coupons/:couponId/deactivate', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._couponController.deActivateCoupon.bind(this._couponController));
        //=============== finanace and commision ======================
        this._router.get('/commissions/summary', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminFinanceController.getCommissionOverview.bind(this._adminFinanceController));
        this._router.get('/commissions/vendors', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminFinanceController.getCommissionsByVendors.bind(this._adminFinanceController));
        this._router.get('/commissions/packages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminFinanceController.getCommissionsByVendorsPackages.bind(this._adminFinanceController));
        //====payout
        this._router.post('/payouts/:scheduleId/release', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._payoutController.releasePayout.bind(this._adminFinanceController));
        this._router.patch('/payouts/:payoutId/retry', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._payoutController.retryPayout.bind(this._payoutController));
        this._router.get('/payouts/overview', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._payoutController.payoutOverview.bind(this._payoutController));
        this._router.get('/payouts/schedules', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._payoutController.getPayoutSchedules.bind(this._payoutController));
        this._router.get('/payouts/stats', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._payoutController.payoutStats.bind(this._payoutController));
        this._router.get('/payouts/:scheduleId/details', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN, roles_1.USER_ROLES.VENDOR]), this._payoutController.schedulePayoutDetails.bind(this._payoutController));
        this._router.get('/payouts', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._payoutController.findAllPayouts.bind(this._payoutController));
        // dashboard
        this._router.get('/dashboard/stats', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminController.dashboardStats.bind(this._adminController));
        this._router.get('/dashboard/top-performers', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminController.dashboardTopPerformers.bind(this._adminController));
        this._router.get('/dashboard/actions-required', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminController.dashboardActionsRequired.bind(this._adminController));
        this._router.get('/dashboard/revenue-trend', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._adminController.dashboardRevenueTrend.bind(this._adminController));
        this._router.get('/contacts-enquiry', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._contactController.contactEnquiries.bind(this._contactController));
        this._router.patch('/contacts-enquiry/:enquiryId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.ADMIN]), this._contactController.updateEnquiry.bind(this._contactController));
    }
};
exports.AdminRoutes = AdminRoutes;
exports.AdminRoutes = AdminRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAdminController')),
    __param(1, (0, tsyringe_1.inject)('IAdminUserController')),
    __param(2, (0, tsyringe_1.inject)('IAdminVendorController')),
    __param(3, (0, tsyringe_1.inject)('IAdminCategoryController')),
    __param(4, (0, tsyringe_1.inject)('IAdminCancellationPolicyController')),
    __param(5, (0, tsyringe_1.inject)('IAdminVendorPackageOversightController')),
    __param(6, (0, tsyringe_1.inject)('ICouponController')),
    __param(7, (0, tsyringe_1.inject)('IAdminFinanceController')),
    __param(8, (0, tsyringe_1.inject)('IPayoutController')),
    __param(9, (0, tsyringe_1.inject)('IContactController')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AdminRoutes);
