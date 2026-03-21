import { RequestHandler } from 'express';

export interface IUserController {
  getPublicPackages: RequestHandler;
  getCategories: RequestHandler;
  getPackageDetails: RequestHandler;
}
