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
exports.UserRoutes = void 0;
const tsyringe_1 = require("tsyringe");
const base_route_1 = __importDefault(require("../base.route"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const aurhorization_middleware_1 = require("../../middlewares/aurhorization.middleware");
const roles_1 = require("../../shared/constants/roles");
// import { otpLimiter } from '../../config/rate.limiter.config';
// import { makeRateLimiter } from '../../middlewares/rate.limiter.middleware';
const validate_dto_middleware_1 = require("../../middlewares/validate.dto.middleware");
const request_dtos_1 = require("../../types/dtos/user/request.dtos");
const public_package_validation_1 = require("../../validators/public-package.validation");
const rate_limiter_middleware_1 = require("../../middlewares/rate.limiter.middleware");
const rate_limiter_config_1 = require("../../config/rate.limiter.config");
const contact_validation_1 = require("../../validators/contact.validation");
let UserRoutes = class UserRoutes extends base_route_1.default {
    constructor(_userController, _userProfileController, _chatController, _walletController, _couponController, _contactController) {
        super();
        this._userController = _userController;
        this._userProfileController = _userProfileController;
        this._chatController = _chatController;
        this._walletController = _walletController;
        this._couponController = _couponController;
        this._contactController = _contactController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        // public //
        this._router.get('/packages/public', (0, validate_dto_middleware_1.validateDTO)(public_package_validation_1.publicPackageQuerySchema), this._userController.getPublicPackages.bind(this._userController));
        this._router.get('/packages/popular', this._userController.getPopularPackages.bind(this._userController));
        this._router.get('/packages/recommended', auth_middleware_1.optionalAuth, this._userController.getRecommendedPackages.bind(this._userController));
        this._router.get('/packages/categories', this._userController.getCategories.bind(this._userController));
        this._router.get('/packages/:packageId', this._userController.getPackageDetails.bind(this._userController));
        this._router.get('/packages/:packageId/schedules', this._userController.getPackageSchedules.bind(this._userController));
        this._router.get('/packages/vendors/:vendorId/profile', this._userController.getVendorPublicProfile.bind(this._userController));
        this._router.get('/me', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._userProfileController.profile.bind(this._userController));
        this._router.put('/me', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.UpdateProfileSchema), auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER, roles_1.USER_ROLES.VENDOR]), this._userProfileController.updateProfile.bind(this._userProfileController));
        this._router.post('/me/change-email', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.ChangeEmailRequestSchema), auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER, roles_1.USER_ROLES.VENDOR]), this._userProfileController.updateEmailRequest.bind(this._userProfileController));
        this._router.patch('/me/email', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.UpdateEmailSchema), auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER, roles_1.USER_ROLES.VENDOR]), this._userProfileController.updateEmail.bind(this._userProfileController));
        this._router.patch('/me/password', (0, validate_dto_middleware_1.validateDTO)(request_dtos_1.ResetPasswordSchema), auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER, roles_1.USER_ROLES.VENDOR]), this._userProfileController.resetPassword.bind(this._userProfileController));
        // wishlist
        this._router.post('/wishlist/:packageId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), (0, rate_limiter_middleware_1.makeRateLimiter)(rate_limiter_config_1.wishlistToggleLimiter, 'userId'), this._userController.toggleWishlist.bind(this._userController));
        this._router.get('/wishlist/ids', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._userController.getWishlistedIds.bind(this._userController));
        this._router.get('/wishlist', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._userController.getWishlist.bind(this._userController));
        this._router.get('/wishlist/count', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._userController.getWishlistCount.bind(this._userController));
        // Chat
        this._router.get('/chats/:chatId', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._chatController.getUserChat.bind(this._chatController));
        this._router.post('/chats/:chatId/messages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._chatController.sendUserMessage.bind(this._chatController));
        this._router.get('/chats/:chatId/messages', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._chatController.getUserChatMessages.bind(this._chatController));
        // Wallet
        this._router.get('/wallet/balance', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._walletController.getWalletBalance.bind(this._walletController));
        this._router.get('/wallet', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._walletController.getWallet.bind(this._walletController));
        //dashboard
        this._router.get('/dashboard', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._userController.dashboard.bind(this._userController));
        // reward
        this._router.get('/reward/unrevealed', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._couponController.getUserReward.bind(this._couponController));
        this._router.patch('/reward/:rewardId/reveal', auth_middleware_1.isAuthenticated, (0, aurhorization_middleware_1.authorize)([roles_1.USER_ROLES.USER]), this._couponController.revealReward.bind(this._couponController));
        this._router.post('/contacts-enquiry', auth_middleware_1.optionalAuth, (0, validate_dto_middleware_1.validateDTO)(contact_validation_1.contactFormRequestSchema), this._contactController.createContact.bind(this._contactController));
    }
};
exports.UserRoutes = UserRoutes;
exports.UserRoutes = UserRoutes = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserController')),
    __param(1, (0, tsyringe_1.inject)('IUserProfileController')),
    __param(2, (0, tsyringe_1.inject)('IChatController')),
    __param(3, (0, tsyringe_1.inject)('IWalletController')),
    __param(4, (0, tsyringe_1.inject)('ICouponController')),
    __param(5, (0, tsyringe_1.inject)('IContactController')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], UserRoutes);
