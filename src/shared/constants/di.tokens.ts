export const SERVICE_TOKENS = {
  AUTH_SERVICE: 'IAuthService',
  TOKEN_SERVICE: 'ITokenService',
  VERIFICATION_SERVICE: 'IVerificationService',
  GOOGLE_SERVICE: 'IGoogleService',
  PASSWORD_SERVICE: 'IPasswordService',
} as const;

export const CONTROLLER_TOKENS = {
  AUTH_CONTROLLER: 'IAuthController',
  VERIFICATION_CONTROLLER: 'IVerificationController',
} as const;

export const COMMON_TOKENS = {
  BCRYPT_UTILS: 'IBcryptUtils',
  EMAIL_UTILS: 'IEmailUtils',
} as const;

export const REPOSITORY_TOKENS = {
  USER_REPOSITORY: 'IUserRepository',
} as const;
