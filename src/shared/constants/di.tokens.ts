export const SERVICE_TOKENS = {
  AUTH_SERVICE: 'IAuthService',
  TOKEN_SERVICE: 'ITokenService',
  VERIFICATION_SERVICE: 'IVerificationService',
  GOOGLE_SERVICE: 'IGoogleService',
  PASSWORD_SERVICE: 'IPasswordService',
  TOKEN_BLACKLIST: 'ITokenBlackListService',
  VENDOR_OFFER_SERVICE: 'IVendorOfferService',
} as const;

export const CONTROLLER_TOKENS = {
  AUTH_CONTROLLER: 'IAuthController',
  VERIFICATION_CONTROLLER: 'IVerificationController',
  VENDOR_OFFER_CONTROLLER: 'IVendorOfferController',
  STRIPE_CONTROLLER: 'IStripeController',
  PAYOUT_CONTROLLER: 'IPayoutController',
} as const;

export const COMMON_TOKENS = {
  BCRYPT_UTILS: 'IBcryptUtils',
  EMAIL_UTILS: 'IEmailUtils',
} as const;

export const REPOSITORY_TOKENS = {
  USER_REPOSITORY: 'IUserRepository',
  NOTIFICATION_REPOSITORY: 'INotificationRepository',
  CHAT_REPOSITORY: 'IChatRepository',
  OFFER_REPOSITORY: 'IOfferRepository',
} as const;
