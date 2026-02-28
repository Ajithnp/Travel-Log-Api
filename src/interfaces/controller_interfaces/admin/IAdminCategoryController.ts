import { RequestHandler } from 'express';

export interface IAdminCategoryController {
  createCategory: RequestHandler;
  updateCategory: RequestHandler;
  toggleCategoryStatus: RequestHandler;
  getAllCategories: RequestHandler;
  getPendingRequest: RequestHandler;
  reviewCategoryRequest: RequestHandler;
}
