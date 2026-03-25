export const CACHE_KEYS = {
  wishlistedIds: (userId: string) => `wishlist:ids:${userId}`,
  wishlistFull: (userId: string) => `wishlist:full:${userId}`,
};
 
export const CACHE_TTL = {
  ids: 60 * 5,   // 5 minutes — listing page
  count: 60 * 5, 
  full: 60 * 2,  // 2 minutes — wishlist page
};