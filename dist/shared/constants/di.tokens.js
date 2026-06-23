"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPOSITORY_TOKENS = exports.COMMON_TOKENS = exports.CONTROLLER_TOKENS = exports.SERVICE_TOKENS = void 0;
exports.SERVICE_TOKENS = {
    AUTH_SERVICE: 'IAuthService',
    TOKEN_SERVICE: 'ITokenService',
    VERIFICATION_SERVICE: 'IVerificationService',
    GOOGLE_SERVICE: 'IGoogleService',
    PASSWORD_SERVICE: 'IPasswordService',
    TOKEN_BLACKLIST: 'ITokenBlackListService',
    VENDOR_OFFER_SERVICE: 'IVendorOfferService',
};
exports.CONTROLLER_TOKENS = {
    AUTH_CONTROLLER: 'IAuthController',
    VERIFICATION_CONTROLLER: 'IVerificationController',
    VENDOR_OFFER_CONTROLLER: 'IVendorOfferController',
    STRIPE_CONTROLLER: 'IStripeController',
    PAYOUT_CONTROLLER: 'IPayoutController',
};
exports.COMMON_TOKENS = {
    BCRYPT_UTILS: 'IBcryptUtils',
    EMAIL_UTILS: 'IEmailUtils',
};
exports.REPOSITORY_TOKENS = {
    USER_REPOSITORY: 'IUserRepository',
    NOTIFICATION_REPOSITORY: 'INotificationRepository',
    CHAT_REPOSITORY: 'IChatRepository',
    OFFER_REPOSITORY: 'IOfferRepository',
};
