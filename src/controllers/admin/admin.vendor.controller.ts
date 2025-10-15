//Examples: approveVendor, rejectVendor, viewAllVendors, suspendVendor
import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IAdminVendorController } from 'interfaces/controller_interfaces/admin/IAdminVendorController';
import { IAdminVendorService } from '../../interfaces/service_interfaces/admin/IAdminVendorService';
import { IApiResponse } from '../../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constants/messages';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import mongoose from 'mongoose';
import { AppError } from '../../errors/AppError';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { clearAuthCookies } from '../../shared/utils/cookie.helper';
import { IAdminUserService } from 'interfaces/service_interfaces/admin/IAdminUserService';
import { USER_ROLES } from '../../shared/constants/roles';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
@injectable()
export class AdminVendorController implements IAdminVendorController {
  constructor(
    @inject('IAdminVendorService')
    private _adminVendorService: IAdminVendorService,
    @inject('IAdminUserService')
    private _adminUserService: IAdminUserService,
  ) {}

  async vendorVerificationRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    try {
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
    } catch (error) {
      next(error);
    }
  }

  //=======================================================================
  async updateVendorverification(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { vendorId } = req.params;
    const { status, reasonForReject } = req.body;

    try {
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
    } catch (error) {
      next(error);
    }
  }
  //===================================get vendors=======================================
  async getVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    try {
      const vendors = await this._adminUserService.fetchUsers(
        page,
        limit,
        USER_ROLES.VENDOR,
        search,
        selectedFilter,
      );

      const successResponse: IApiResponse<typeof vendors> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: vendors,
      };

      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
      next(error);
    }
  }
  //===============================================================================

  async blockOrUnclockVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { vendorId } = req.params;
    const { blockUser, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      throw new AppError(ERROR_MESSAGES.INVALID_USER_ID, HTTP_STATUS.BAD_REQUEST);
    }

    if (typeof blockUser !== 'boolean') {
      throw new AppError(ERROR_MESSAGES.INVALID_REQUEST_INPUT, HTTP_STATUS.BAD_REQUEST);
    }

    if (blockUser && !reason) {
      throw new AppError(ERROR_MESSAGES.REASON_NOT_PROVIDED, HTTP_STATUS.BAD_REQUEST);
    }

    const accessToken = req.cookies?.[JWT_TOKEN.ACCESS_TOKEN];

    try {
      if (blockUser && accessToken) {
        await this._adminUserService.updateUserAccess(vendorId, blockUser, reason, accessToken);
      } else {
        await this._adminUserService.updateUserAccess(vendorId, blockUser, reason);
      }

      clearAuthCookies(res, JWT_TOKEN.REFRESH_TOKEN);

      const successResponse: IApiResponse = {
        success: SUCCESS_STATUS.SUCCESS,
        message: blockUser
          ? SUCCESS_MESSAGES.USER_BLOCKED_SUCCESS
          : SUCCESS_MESSAGES.USER_UNBLOCKED_SUCCESS,
      };
      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
      next(error);
    }
  }
}
