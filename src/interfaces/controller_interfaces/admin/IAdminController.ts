import { RequestHandler } from "express";

export interface IAdminController {
   dashboardStats: RequestHandler;
   dashboardTopPerformers: RequestHandler;
   dashboardActionsRequired: RequestHandler;
   dashboardRevenueTrend: RequestHandler;
};