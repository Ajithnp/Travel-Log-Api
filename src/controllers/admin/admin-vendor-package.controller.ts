import { inject, injectable } from 'tsyringe';
import { IAdminVendorPackageOversightController } from '../../interfaces/controller_interfaces/admin/IAdminVendorPackageController';
import { IAdminVendorPackageOversightService } from '../../interfaces/service_interfaces/admin/IAdminVendorPackageService';
import asyncHandler from 'express-async-handler';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';

@injectable()
export class AdminVendorPackageOversightController implements IAdminVendorPackageOversightController {
  constructor(
    @inject('IAdminVendorPackageOversightService')
    private _adminVendorPackageService: IAdminVendorPackageOversightService,
  ) {}

  getPackages = asyncHandler(async (req, res) => {
    const { page, limit, search } = getPaginationOptions(req);

    const data = await this._adminVendorPackageService.getPackages(page, limit, search);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackageDetails = asyncHandler(async (req, res) => {
    const { packageId } = req.params as { packageId: string };

    const data = await this._adminVendorPackageService.getPackageDetails(packageId);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackageSchedules = asyncHandler(async (req, res) => {
    const { packageId } = req.params as { packageId: string };
    const { page, limit } = getPaginationOptions(req);

    const data = await this._adminVendorPackageService.getPackageSchedules(packageId, page, limit);

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}