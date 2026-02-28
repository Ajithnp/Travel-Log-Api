export const PACKAGE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SOFT_DELETED: 'SOFT_DELETED',
} as const;

export const CATEGORY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const;

export type CategoryStatus = (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];

export const APPROVE_REJECT_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'rejected',
} as const;

export type ApproveRejectActions =
  (typeof APPROVE_REJECT_ACTIONS)[keyof typeof APPROVE_REJECT_ACTIONS];
