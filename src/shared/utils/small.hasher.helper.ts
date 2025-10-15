import crypto from 'crypto';

export const smallHasher = (payload: string): string => {
  return crypto.createHash('sha256').update(payload).digest('hex');
};
