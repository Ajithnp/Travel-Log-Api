"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.CACHE_KEYS = void 0;
exports.CACHE_KEYS = {
    wishlistedIds: (userId) => `wishlist:ids:${userId}`,
    wishlistCount: (userId) => `wishlist:count:${userId}`,
    wishlistFull: (userId, page) => `wishlist:full:${userId}:page:${page}`,
    commissionOverview: 'commission:overview',
    schedulePayoutDetails: (scheduleId) => `schedule-payout-details:${scheduleId}`,
    vendorAnalyticsTrend: (vendorId, period, customFrom, customTo) => `vendor:analytics:trend:${vendorId}:${period}:${(customFrom === null || customFrom === void 0 ? void 0 : customFrom.toISOString()) || ''}:${(customTo === null || customTo === void 0 ? void 0 : customTo.toISOString()) || ''}`,
    vendorAnalyticsTopPackages: (vendorId) => `vendor:analytics:top-packages:${vendorId}`,
};
exports.CACHE_TTL = {
    ids: 60 * 5, // 5 minutes
    count: 60 * 5, // 5 minutes
    full: 60 * 2, // 2 minutes
    ttl_5_minutes: 60 * 5,
    ttl_1_minute: 60,
    ttl_10_minutes: 60 * 10,
};
