export const GROUP_TYPE = {
  SOLO: 'SOLO',
  DUO: 'DUO',
  GROUP: 'GROUP',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const VERIFY_PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED_BY_USER: 'cancelled_by_user',
  COMPLETED: 'completed',
  PAYMENT_FAILED: 'payment_failed',

} as const;

export const CANCELATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const CANCELLED_BY = {
  USER: 'user',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;


