import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../../interfaces/controller_interfaces/user/IUserController';
import { IUserService } from '../../interfaces/service_interfaces/user/IUserService';
import { USER_ROLES } from '../../shared/constants/roles';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { AppError } from '../../errors/AppError';
import { IApiResponse } from 'types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { UserProfileResponseDTO } from '../../types/dtos/user/response.dtos';
import { IPublicPackageService } from '../../interfaces/service_interfaces/user/IPublicPackageService';
import logger from '../../config/logger';
import { PublicPackageQuery } from 'validators/public-package.validation';
import { IWishlistService } from '../../interfaces/service_interfaces/user/IWishlistService';
@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService')
    private _userService: IUserService,
    @inject('IPublicPackageService')
    private _publicPackageService: IPublicPackageService,
    @inject('IWishlistService')
    private _wishlistService: IWishlistService,
  ) {}

  getPublicPackages = asyncHandler(async (req, res) => {
    const query = req.query as unknown as PublicPackageQuery;

    const result = await this._publicPackageService.getPublicPackages(query);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getCategories = asyncHandler(async (req, res) => {
    const result = await this._publicPackageService.getCategories();
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackageDetails = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    const result = await this._publicPackageService.getPackageDetails(packageId);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackageSchedules = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    const result = await this._publicPackageService.getPublicSchedulesByPackage(packageId);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  toggleWishlist = asyncHandler(async (req, res) => {
     const userId = req.user?.id!;
    const { packageId } = req.params;

    const result = await this._wishlistService.toggleWishlist(userId,packageId);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

    getWishlistedIds = asyncHandler(async (req, res) => {
     const userId = req.user?.id!;

    const result = await this._wishlistService.getWishlistedIds(userId);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
