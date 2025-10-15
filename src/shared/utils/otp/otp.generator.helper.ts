import * as crypto from 'crypto';

export interface OtpResult {
  otp: string;
  expiresAt: number;
}

export function generateOtpWithExpiry(ttlSeconds = 60): OtpResult {
  const random = crypto.randomBytes(4).readUInt32BE();
  const otp = ((random % 900_000) + 100_000).toString();

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

  return { otp, expiresAt };
}
