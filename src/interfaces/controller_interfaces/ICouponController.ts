import { RequestHandler } from 'express';

export interface ICouponController {
  createCoupon: RequestHandler;
  deActivateCoupon: RequestHandler;
  getAllCoupons: RequestHandler;
  getUserReward: RequestHandler;
  revealReward: RequestHandler;
}
