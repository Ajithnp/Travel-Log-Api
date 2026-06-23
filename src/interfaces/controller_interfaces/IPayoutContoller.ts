import { RequestHandler } from 'express';

export interface IPayoutController {
  getPayoutSchedules: RequestHandler;
  payoutOverview: RequestHandler;
  schedulePayoutDetails: RequestHandler;
  payoutStats: RequestHandler;
  releasePayout: RequestHandler;
  findAllPayouts: RequestHandler;
  retryPayout: RequestHandler;
  findAllVendorPayouts: RequestHandler;
}
