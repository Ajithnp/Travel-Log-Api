"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCELLED_BY = exports.CANCELATION_STATUS = exports.PAYMENT_METHOD = exports.BOOKING_STATUS = exports.VERIFY_PAYMENT_STATUS = exports.PAYMENT_STATUS = exports.GROUP_TYPE = void 0;
exports.GROUP_TYPE = {
    SOLO: 'SOLO',
    DUO: 'DUO',
    GROUP: 'GROUP',
};
exports.PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
};
exports.VERIFY_PAYMENT_STATUS = {
    SUCCESS: 'success',
    FAILURE: 'failure',
};
exports.BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED_BY_USER: 'cancelled_by_user',
    COMPLETED: 'completed',
    PAYMENT_FAILED: 'payment_failed',
};
exports.PAYMENT_METHOD = {
    WALLET: 'wallet',
    STRIPE: 'stripe',
    COMBINED: 'combined',
};
exports.CANCELATION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
exports.CANCELLED_BY = {
    USER: 'user',
    VENDOR: 'vendor',
    ADMIN: 'admin',
};
