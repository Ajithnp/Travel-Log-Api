import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IAdminVendorController } from '../../interfaces/controller_interfaces/admin/IAdminVendorController';
import {
  IAdminVendorService,
  VendorProfileStatsDTO,
} from '../../interfaces/service_interfaces/admin/IAdminVendorService';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { IAdminUserService } from '../../interfaces/service_interfaces/admin/IAdminUserService';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
@injectable()
export class AdminVendorController implements IAdminVendorController {
  constructor(
    @inject('IAdminVendorService')
    private _adminVendorService: IAdminVendorService,
    @inject('IAdminUserService')
    private _adminUserService: IAdminUserService,
  ) {}

  vendorVerificationRequest = asyncHandler(async (req, res) => {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    const data = await this._adminVendorService.vendorVerificationRequests(
      page,
      limit,
      search,
      selectedFilter,
    );

    const successResponse: IApiResponse<typeof data> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateVendorVerification = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { status, reasonForReject } = req.body;

    await this._adminVendorService.updateVendorVerification(vendorId, {
      status,
      reasonForReject,
    });

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message:
        status === VENDOR_VERIFICATION_STATUS.APPROVED
          ? SUCCESS_MESSAGES.VENDOR_VERIFICATION_SUCCESS
          : SUCCESS_MESSAGES.VENDOR_VERIFICATION_REJECTED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendors = asyncHandler(async (req, res) => {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    const vendors = await this._adminVendorService.getVendors(page, limit, search, selectedFilter);

    const successResponse: IApiResponse<typeof vendors> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: vendors,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendorProfile = asyncHandler(async (req, res) => {
    const { vendorId } = req.params as { vendorId: string };

    const vendorProfile = await this._adminVendorService.getVendorProfile(vendorId);

    const successResponse: IApiResponse<typeof vendorProfile> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: vendorProfile,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendorProfileStats = asyncHandler(async (req, res) => {
    const { vendorId } = req.params as { vendorId: string };

    const vendorProfileStats = await this._adminVendorService.getVendorProfileStats(vendorId);

    const successResponse: IApiResponse<VendorProfileStatsDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: vendorProfileStats,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
