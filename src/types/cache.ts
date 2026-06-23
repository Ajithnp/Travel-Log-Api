export const CACHE_KEYS = {
  wishlistedIds: (userId: string) => `wishlist:ids:${userId}`,
  wishlistCount: (userId: string) => `wishlist:count:${userId}`,
  wishlistFull: (userId: string, page: number) => `wishlist:full:${userId}:page:${page}`,
  commissionOverview: 'commission:overview',
  schedulePayoutDetails: (scheduleId: string) => `schedule-payout-details:${scheduleId}`,
  vendorAnalyticsTrend: (vendorId: string, period: string, customFrom?: Date, customTo?: Date) =>
    `vendor:analytics:trend:${vendorId}:${period}:${customFrom?.toISOString() || ''}:${customTo?.toISOString() || ''}`,
  vendorAnalyticsTopPackages: (vendorId: string) => `vendor:analytics:top-packages:${vendorId}`,
};

export const CACHE_TTL = {
  ids: 60 * 5, // 5 minutes
  count: 60 * 5, // 5 minutes
  full: 60 * 2, // 2 minutes
  ttl_5_minutes: 60 * 5,
  ttl_1_minute: 60,
  ttl_10_minutes: 60 * 10,
};
