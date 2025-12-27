import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IAdminUserController } from '../../interfaces/controller_interfaces/admin/IAdminUserController';
import { Request, Response } from 'express';
import { IAdminUserService } from '../../interfaces/service_interfaces/admin/IAdminUserService';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { USER_ROLES } from '../../shared/constants/roles';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';

@injectable()
export class AdminUserController implements IAdminUserController {
  constructor(
    @inject('IAdminUserService')
    private _adminUserService: IAdminUserService,
  ) {}

  getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

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
  });

  //==========================================================================================
  blockOrUnblockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { blockUser, reason } = req.body;

    const accessToken = req.cookies?.[JWT_TOKEN.ACCESS_TOKEN];

    if (blockUser && accessToken) {
      await this._adminUserService.updateUserAccess(userId, blockUser, reason, accessToken);
    } else {
      await this._adminUserService.updateUserAccess(userId, blockUser, reason);
    }

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: blockUser
        ? SUCCESS_MESSAGES.USER_BLOCKED_SUCCESS
        : SUCCESS_MESSAGES.USER_UNBLOCKED_SUCCESS,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
