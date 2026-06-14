import { RequestHandler } from "express";

export interface IPayoutController {
    getPayoutSchedules: RequestHandler;
    payoutOverview: RequestHandler;
    // payoutStats: RequestHandler;
    releasePayout: RequestHandler;
}