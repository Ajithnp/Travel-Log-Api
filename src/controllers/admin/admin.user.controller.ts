//Examples: blockUser, unblockUser, viewAllUsers, deleteUser.
import { inject, injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { IAdminUserController } from '../../interfaces/controller_interfaces/admin/IAdminUserController';
import { Request, Response, NextFunction } from 'express';
import { IAdminUserService } from '../../interfaces/service_interfaces/admin/IAdminUserService';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { clearAuthCookies } from '../../shared/utils/cookie.helper';
import { USER_ROLES } from '../../shared/constants/roles';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';

@injectable()
export class AdminUserController implements IAdminUserController {
  constructor(
    @inject('IAdminUserService')
    private _adminUserService: IAdminUserService,
  ) {}

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    try {
      const users = await this._adminUserService.fetchUsers(
        page,
        limit,
        USER_ROLES.USER,
        search,
        selectedFilter,
      );

      const successResponse: IApiResponse<typeof users> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: users,
      };

      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
      next(error);
    }
  }

  //==========================================================================================
  async blockOrUnclockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.params;
    const { blockUser, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
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
        await this._adminUserService.updateUserAccess(userId, blockUser, reason, accessToken);
      } else {
        await this._adminUserService.updateUserAccess(userId, blockUser, reason);
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
