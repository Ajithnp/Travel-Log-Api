import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IAdminUserController } from '../../interfaces/controller_interfaces/admin/IAdminUserController';
import { IAdminUserService } from '../../interfaces/service_interfaces/admin/IAdminUserService';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IApiResponse } from '../../types/common/IApiResponse';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { USER_ROLES } from '../../shared/constants/roles';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import { CancelationStatus } from '../../types/entities/booking.entity';

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

 
  getCancellationRequests = asyncHandler(async (req, res) => {
    const { page, limit } = getPaginationOptions(req);
    const { status } = req.query as { status: CancelationStatus };

    const requests = await this._adminUserService.getCancellationRequests(page, limit, status);

    const successResponse: IApiResponse<typeof requests> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: requests,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getCancellationRequestDetails = asyncHandler(async (req, res) => {
    const { bookingId } = req.params as {bookingId: string};

    const requestDetails = await this._adminUserService.getCancellationRequestDetails(bookingId);

    const successResponse: IApiResponse<typeof requestDetails> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: requestDetails,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  rejectCancellationRequest = asyncHandler(async (req, res) => {
    const { bookingId } = req.params as {bookingId: string};
    const adminId = req.user.id;
    const { reason } = req.body as {reason: string};
    
    await this._adminUserService.rejectCancellationRequest(bookingId,adminId,reason);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.CANCELLATION_REQUEST_REJECETED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  approveCancellationRequest = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    await this._adminUserService.approveCancellationRequest(bookingId);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.CANCELLATION_REQUEST_APPROVED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
