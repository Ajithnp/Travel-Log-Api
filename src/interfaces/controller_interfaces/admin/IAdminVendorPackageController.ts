import { RequestHandler } from 'express';

export interface IAdminVendorPackageOversightController {
  getPackages: RequestHandler;
  getPackageDetails: RequestHandler;
  getPackageSchedules: RequestHandler;
}