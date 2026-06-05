export const PACKAGE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  DELETED: 'DELETED',
} as const;

export const AUTH_PROVIDER = {
  GOOGLE: 'google',
  LOCAL: 'local',
} as const;

export type PackageStatus = (typeof PACKAGE_STATUS)[keyof typeof PACKAGE_STATUS];

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

export const SCHEDULE_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SOLD_OUT: 'sold_out',
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const VENDOR_TABS = {
  CONTACT_INFO: 'contactInfo',
  BUSINESS_INFO: 'businessInfo',
  DOCUMENT_INFO: 'documentInfo',
  CHAT: 'Chats',
  PACKAGE: 'package',
  SCHEDULE: 'schedule',
  BOOKING: 'booking',
  NOTIFICATION: 'notification',
} as const;

export type VendorTabs = (typeof VENDOR_TABS)[keyof typeof VENDOR_TABS];

export const ADMIN_TABS = {
  DASHBOARD: 'dashboard',
  CANCEL_BOOKINGS: 'Cancel Bookings',
  VENDOR_VERIFICATION: 'Vendors Verification Requests',
  USERS: 'users',
  VENDOR: 'vendor',
  PACKAGES: 'packages',
  SCHEDULES: 'schedules',
  BOOKINGS: 'bookings',
  REVENUE: 'revenue',
  NOTIFICATION: 'notification',
} as const;

export type AdminTabs = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS];

export const USER_REWARD_STATUS = {
  UNREVEALED: 'UNREVEALED',
  REVEALED: 'REVEALED',
  USED: 'USED',
  EXPIRED: 'EXPIRED',
} as const;
