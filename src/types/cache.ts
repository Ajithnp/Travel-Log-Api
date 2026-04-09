export const CACHE_KEYS = {
  wishlistedIds: (userId: string) => `wishlist:ids:${userId}`,
  wishlistCount: (userId: string) => `wishlist:count:${userId}`,
  wishlistFull: (userId: string, page: number) => `wishlist:full:${userId}:page:${page}`,
};

export const CACHE_TTL = {
  ids: 60 * 5, // 5 minutes — listing page
  count: 60 * 5, // 5 minutes — navbar badge
  full: 60 * 2, // 2 minutes — wishlist page
};
