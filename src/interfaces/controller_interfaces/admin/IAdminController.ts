import { RequestHandler } from "express";

export interface IAdminController {
   dashboardStats: RequestHandler;
}