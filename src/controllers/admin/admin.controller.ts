import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { IAdminController } from "../../interfaces/controller_interfaces/admin/IAdminController";
import { IAdminService } from "../../interfaces/service_interfaces/admin/IAdminService";
import { IApiResponse } from "../../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../../shared/constants/messages";

@injectable()
export class AdminController implements IAdminController {
    constructor(
        @inject('IAdminService')
        private _adminService: IAdminService,
    ) { }

    dashboardStats = expressAsyncHandler(async (req: Request, res: Response):Promise<void> => {
        const result = await this._adminService.dashboardStats();

        const successResponse: IApiResponse<typeof result> = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.OK,
            data: result,
        };

        res.status(HTTP_STATUS.OK).json(successResponse);
    });

    dashboardTopPerformers = expressAsyncHandler(async (req: Request, res: Response):Promise<void> => {
        const result = await this._adminService.dashboardTopPerformers();

        const successResponse: IApiResponse<typeof result> = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.OK,
            data: result,
        };

        res.status(HTTP_STATUS.OK).json(successResponse);
    });

    dashboardActionsRequired = expressAsyncHandler(async (req: Request, res: Response):Promise<void> => {
        const result = await this._adminService.dashboardActionsRequired();

        const successResponse: IApiResponse<typeof result> = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.OK,
            data: result,
        };

        res.status(HTTP_STATUS.OK).json(successResponse);
    });

    dashboardRevenueTrend = expressAsyncHandler(async (req: Request, res: Response):Promise<void> => {
        const { period, customFrom, customTo } = req.query as { period: string; customFrom?: string; customTo?: string };
        const result = await this._adminService.dashboardRevenueTrend(period || 'week', customFrom, customTo);

        const successResponse: IApiResponse<typeof result> = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.OK,
            data: result,
        };

        res.status(HTTP_STATUS.OK).json(successResponse);
    });
}