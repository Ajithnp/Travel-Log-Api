"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTACT_STATUS = exports.INR_TO_USD_TEST_RATE = exports.PAYOUT_STATUS = exports.USER_REWARD_STATUS = exports.ADMIN_TABS = exports.VENDOR_TABS = exports.SCHEDULE_STATUS = exports.APPROVE_REJECT_ACTIONS = exports.CATEGORY_STATUS = exports.AUTH_PROVIDER = exports.PACKAGE_STATUS = void 0;
exports.PACKAGE_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    DELETED: 'DELETED',
};
exports.AUTH_PROVIDER = {
    GOOGLE: 'google',
    LOCAL: 'local',
};
exports.CATEGORY_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    REJECTED: 'rejected',
};
exports.APPROVE_REJECT_ACTIONS = {
    APPROVE: 'approve',
    REJECT: 'rejected',
};
exports.SCHEDULE_STATUS = {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    SOLD_OUT: 'sold_out',
};
exports.VENDOR_TABS = {
    CONTACT_INFO: 'contactInfo',
    BUSINESS_INFO: 'businessInfo',
    DOCUMENT_INFO: 'documentInfo',
    CHAT: 'Chats',
    PACKAGE: 'package',
    SCHEDULE: 'schedule',
    BOOKING: 'booking',
    NOTIFICATION: 'notification',
};
exports.ADMIN_TABS = {
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
};
exports.USER_REWARD_STATUS = {
    UNREVEALED: 'UNREVEALED',
    REVEALED: 'REVEALED',
    USED: 'USED',
    EXPIRED: 'EXPIRED',
};
exports.PAYOUT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};
exports.INR_TO_USD_TEST_RATE = 83;
exports.CONTACT_STATUS = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
};
