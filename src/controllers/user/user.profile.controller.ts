import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { IUserService } from '../../interfaces/service_interfaces/user/IUserService';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { AppError } from '../../errors/AppError';
import { IApiResponse } from '../../types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';

import {
  UserProfileResponseDTO,
  IUpdateEmailResponseDTO,
} from '../../types/dtos/user/response.dtos';
import { IUserProfileController } from 'interfaces/controller_interfaces/user/IUserProfileController';
import { clearAuthCookies } from '../../shared/utils/cookie.helper';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject('IUserService')
    private _userService: IUserService,
  ) {}

  profile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
    }

    const doc = await this._userService.profile(req.user.id);

    const successResponse: IApiResponse<UserProfileResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: doc,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const updateProfileRequestPayload = req.body;

    await this._userService.updateProfile({
      ...updateProfileRequestPayload,
      email: req.user!.email,
    });

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateEmailRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const updateEmailRequestPayload = req.body;

    const updateEmailData = await this._userService.updateEmailRequest(updateEmailRequestPayload);

    const successResponse: IApiResponse<IUpdateEmailResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OTP_SEND,
      data: updateEmailData,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.[JWT_TOKEN.REFRESH_TOKEN];

    if (!refreshToken) {
      throw new AppError(ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, HTTP_STATUS.UNAUTHORIZED);
    }

    await this._userService.updateEmail({
      ...req.body,
      oldEmail: req.user!.email,
      userId: req.user!.id,
      refreshToken,
    });

    // force re-authentication
    clearAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN);
    clearAuthCookies(res, JWT_TOKEN.REFRESH_TOKEN);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.EMAIL_UPDATED,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.[JWT_TOKEN.REFRESH_TOKEN];

    if (!refreshToken) {
      throw new AppError(ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, HTTP_STATUS.UNAUTHORIZED);
    }

    await this._userService.resetPassword({
      ...req.body,
      email: req.user!.email,
      token: refreshToken,
    });

    // Force logout after password reset
    clearAuthCookies(res, JWT_TOKEN.REFRESH_TOKEN);
    clearAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
