import { RequestHandler } from 'express';

export interface IVendorController {
  profile: RequestHandler;
  updateProfileLogo: RequestHandler;
  vendorVerificationSubmit: RequestHandler;
  getRejectedVendor: RequestHandler;
  vendorVerificationReapply: RequestHandler;
}
