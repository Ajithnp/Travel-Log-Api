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
exports.VendorRoutes = void 0;
const tsyringe_1 = require("tsyringe");
const base_route_1 = __importDefault(require("../base.route"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const roles_1 = require("../../shared/constants/roles");
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const base_package_schema_1 = require("../../validators/vendor/package/base-package.schema");
const category_validation_1 = require("../../validators/vendor/category.validation");
const category_validation_2 = require("../../validators/category.validation");
const schedule_package_validation_1 = require("../../validators/vendor/schedule-package.validation");
const profile_validation_1 = require("../../validators/vendor/profile.validation");
const vendor_verification_1 = require("../../validators/vendor/vendor-verification");
const offer_validation_1 = require("../../validators/vendor/offer.validation");
const di_tokens_1 = require("../../shared/constants/di.tokens");
let VendorRoutes = class VendorRoutes extends base_route_1.default {
    constructor(_vendorController, _vendorPackageController, _vendorCategoryController, _schedulePackageController, _chatController, _documentController, _vendorOfferController, _vendorRevenueController, _payoutController, _reviewController) {
        super();
        this._vendorController = _vendorController;
        this._vendorPackageController = _vendorPackageController;
        this._vendorCategoryController = _vendorCategoryController;
        this._schedulePackageController = _schedulePackageController;
        this._chatController = _chatController;
        this._documentController = _documentController;
        this._vendorOfferController = _vendorOfferController;
        this._vendorRevenueController = _vendorRevenueController;
        this._payoutController = _payoutController;
        this._reviewController = _reviewController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this._router.get('/me', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorController.profile.bind(this._vendorController));
        this._router.patch('/me/profileLogo', (0, validate_dto_middleware_1.validateDTO)(profile_validation_1.UpdateProfileLogoRequestSchema), auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorController.updateProfileLogo.bind(this._vendorController));
        this._router.post('/verification', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(vendor_verification_1.VendorVerificationSchema), this._vendorController.vendorVerificationSubmit.bind(this._vendorController));
        this._router.get('/verification/:vendorId/rejected', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorController.getRejectedVendor.bind(this._vendorController));
        this._router.put('/verification/:vendorInfoId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(vendor_verification_1.VendorVerificationSchema), this._vendorController.vendorVerificationReapply.bind(this._vendorController));
        /*---------------Package management--------------------- */
        this._router.post('/packages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(base_package_schema_1.PackageCreateUnionSchema), this._vendorPackageController.createPackage.bind(this._vendorPackageController));
        this._router.get('/packages/offers-context', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.getPackagesForOffer.bind(this._vendorPackageController));
        this._router.get('/packages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.fetchPackages.bind(this._vendorPackageController));
        this._router.get('/packages/meta', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.packageMetaData.bind(this._vendorPackageController));
        this._router.get('/packages/reviews', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._reviewController.getVendorPackagesReviwes.bind(this._reviewController));
        this._router.get('/packages/reviews/stats', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._reviewController.getVendorPackagesReviwesStats.bind(this._reviewController));
        this._router.put('/packages/:packageId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(base_package_schema_1.PackageCreateUnionSchema), this._vendorPackageController.updatePackage.bind(this._vendorPackageController));
        this._router.get('/packages/:packageId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.fetPackagesWithId.bind(this._vendorPackageController));
        this._router.delete('/packages/:packageId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.deletePackage.bind(this._vendorPackageController));
        this.router.patch('/packages/:packageId/restore', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.restorePackage.bind(this._vendorPackageController));
        this._router.get('/packages/:packageId/schedule-context', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorPackageController.getPackageScheduleContext.bind(this._vendorPackageController));
        //======category
        this._router.get('/categories/request', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(category_validation_1.getRequestedCategorySchema), this._vendorCategoryController.getVendorsRequestCategories.bind(this._vendorPackageController));
        this._router.get('/categories', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorCategoryController.getActiveCategories.bind(this._vendorPackageController));
        this._router.post('/categories', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(category_validation_2.requestCategorySchema), this._vendorCategoryController.requestCategory.bind(this._vendorPackageController));
        // schedule package
        this._router.post('/schedules/packages/:packageId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(schedule_package_validation_1.createScheduleSchema), this._schedulePackageController.createSchedule.bind(this._schedulePackageController));
        this._router.get('/schedules', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._schedulePackageController.fetchSchedules.bind(this._schedulePackageController));
        this._router.get('/schedules/:scheduleId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._schedulePackageController.getSchedule.bind(this._schedulePackageController));
        this._router.get('/schedules/:scheduleId/booking-summary', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._schedulePackageController.getVendorScheduleBookingSummary.bind(this._schedulePackageController));
        this._router.get('/schedules/:scheduleId/bookings', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._schedulePackageController.getScheduleBookings.bind(this._schedulePackageController));
        this._router.get('/schedules/:scheduleId/bookings/:bookingId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._schedulePackageController.getScheduleBookingDetails.bind(this._schedulePackageController));
        this._router.patch('/schedules/:scheduleId/status', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(schedule_package_validation_1.updateScheduleStatusSchema), this._schedulePackageController.updateScheduleStatus.bind(this._schedulePackageController));
        this._router.get('/schedules/:scheduleId/bookings/export/csv', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._documentController.getScheduleBookingsCSV.bind(this._documentController));
        //===chat
        this._router.get('/chats', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.getVendorChats.bind(this._chatController));
        this._router.get('/chats/:chatId/messages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.getVendorChatMessages.bind(this._chatController));
        this._router.post('/chats/:chatId/messages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.sendVendorMessage.bind(this._chatController));
        this._router.patch('/chats/:chatId/pin', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.pinMessage.bind(this._chatController));
        this._router.patch('/chats/:chatId/members/:userId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.removeMember.bind(this._chatController));
        this._router.patch('/chats/:chatId/archive', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.archiveChat.bind(this._chatController));
        this._router.get('/chats/:chatId/members', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.getChatMembers.bind(this._chatController));
        this._router.patch('/chats/:chatId/read', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._chatController.markChatAsReadForVendor.bind(this._chatController));
        //===offers
        this._router.post('/offers', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(offer_validation_1.createOfferSchema), this._vendorOfferController.createOffer.bind(this._vendorOfferController));
        this._router.get('/offers', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), (0, validate_dto_middleware_1.validateDTO)(offer_validation_1.getVendorOffersQuerySchema), this._vendorOfferController.getOffers.bind(this._vendorOfferController));
        this._router.patch('/offers/:offerId/deactivate', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorOfferController.deactivateOffer.bind(this._vendorOfferController));
        //== revenue
        this._router.get('/revenue/packages-earnings', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorRevenueController.packagesEarningOverview.bind(this._vendorRevenueController));
        //=== payouts
        this._router.get('/payouts', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._payoutController.findAllVendorPayouts.bind(this._payoutController));
        //==dashboard
        this._router.get('/dashboard/summary', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorController.getVendorSummaryStats.bind(this._vendorController));
        this._router.get('/dashboard/charts', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorController.dashboardAnalytics.bind(this._vendorController));
        this._router.get('/dashboard/recent-activity', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.VENDOR]), this._vendorController.dashboardRecentActivity.bind(this._vendorController));
    }
};
exports.VendorRoutes = VendorRoutes;
exports.VendorRoutes = VendorRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorController')),
    __param(1, (0, tsyringe_1.inject)('IVendorPackageController')),
    __param(2, (0, tsyringe_1.inject)('IVendorCategoryController')),
    __param(3, (0, tsyringe_1.inject)('ISchedulePackageController')),
    __param(4, (0, tsyringe_1.inject)('IChatController')),
    __param(5, (0, tsyringe_1.inject)('IDocumentController')),
    __param(6, (0, tsyringe_1.inject)(di_tokens_1.CONTROLLER_TOKENS.VENDOR_OFFER_CONTROLLER)),
    __param(7, (0, tsyringe_1.inject)('IVendorRevenueController')),
    __param(8, (0, tsyringe_1.inject)('IPayoutController')),
    __param(9, (0, tsyringe_1.inject)('IReviewController')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], VendorRoutes);
