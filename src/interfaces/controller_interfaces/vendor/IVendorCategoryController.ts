import { RequestHandler } from 'express';

export interface IVendorCategoryController {
  getVendorsRequestCategories: RequestHandler;
  getActiveCategories: RequestHandler;
  requestCategory: RequestHandler;
}
