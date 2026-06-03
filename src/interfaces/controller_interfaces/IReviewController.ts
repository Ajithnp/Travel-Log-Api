import { RequestHandler } from 'express';

export interface IReviewController {
  addReview: RequestHandler;
  deleteReview: RequestHandler;
  getPackagePublicReviews: RequestHandler;
  getPackageReviewsStats: RequestHandler;
}
