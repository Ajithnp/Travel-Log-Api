import { RequestHandler } from 'express';

export interface IAdminVendorPackageOversightController {
  getPackages: RequestHandler;
}