import { RequestHandler } from 'express';

export interface IVendorPackageController {
  createPackage: RequestHandler;
  updatePackage: RequestHandler;
  fetchPackages: RequestHandler;
  fetPackagesWithId: RequestHandler;
  getPackageScheduleContext: RequestHandler;
}
