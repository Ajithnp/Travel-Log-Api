import { RequestHandler } from "express";

export interface IAdminFinanceController {
    getCommissionOverview:RequestHandler;
    getCommissionsByVendors:RequestHandler;
    getCommissionsByVendorsPackages:RequestHandler;
};
