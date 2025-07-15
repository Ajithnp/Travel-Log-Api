import * as crypto from 'crypto';

export function generateOtpWithExpiry(ttlSeconds = 60): { otp: string; expiresAt: Date } {
  const random = crypto.randomBytes(4).readUInt32BE();   
  const otp = (random % 900_000 + 100_000).toString();  

  const expiresAt = new Date(Date.now() + ttlSeconds * 1_000); 

  return { otp, expiresAt };
}