import { RequestHandler } from 'express';

export interface IUserController {
  getPublicPackages: RequestHandler;
  getCategories: RequestHandler;
  getPackageDetails: RequestHandler;
  getPackageSchedules: RequestHandler;
  toggleWishlist: RequestHandler;
  getWishlistedIds: RequestHandler;
  getWishlist: RequestHandler;
  getWishlistCount: RequestHandler;
  getVendorPublicProfile: RequestHandler;
}
