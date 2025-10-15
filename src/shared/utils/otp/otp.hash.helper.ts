import crypto from 'crypto';
import { config } from '../../../config/env';

export function hashOtp(otp: string, indentifier: string): string {
  return crypto
    .createHmac('sha256', config.otp.OTP_SECRET)
    .update(`${indentifier}:${otp}`)
    .digest('hex');
}
