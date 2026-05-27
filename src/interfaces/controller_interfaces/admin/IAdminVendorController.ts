import { RequestHandler } from 'express';

export interface IAdminVendorController {
  vendorVerificationRequest: RequestHandler;
  updateVendorVerification: RequestHandler;
  getVendors: RequestHandler;
  getVendorProfile: RequestHandler;
  getVendorProfileStats: RequestHandler;
}
