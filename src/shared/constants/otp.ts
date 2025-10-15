export const OTP = {
  OTP_LENGTH: 6,
  OTP_TTL_SECONDS: 60, // 5 minutes
  MAX_VERIFY_ATTEMPTS: 5, // before lockout
  ATTEMPT_LOCK_SECONDS: 900, // lock for 15 minutes after max attempts
  RESEND_LIMIT_PER_HOUR: 3,
  RESEND_WINDOW_SECONDS: 3600, // 1 hour
  // OTP_HASH_SECRET: process.env.OTP_HASH_SECRET || 'change_me';
} as const;
