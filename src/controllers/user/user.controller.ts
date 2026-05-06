import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IUserController } from '../../interfaces/controller_interfaces/user/IUserController';
import { IUserService } from '../../interfaces/service_interfaces/user/IUserService';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { IApiResponse } from '../../types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { IPublicPackageService } from '../../interfaces/service_interfaces/user/IPublicPackageService';
import { PublicPackageQuery } from '../../validators/public-package.validation';
import { IWishlistService } from '../../interfaces/service_interfaces/user/IWishlistService';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import { VendorPublicProfileResponseDTO } from '../../types/dtos/user/response.dtos';
import { IPublicVendorService } from '../../interfaces/service_interfaces/user/IPublicVendorService';

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService')
    private _userService: IUserService,
    @inject('IPublicPackageService')
    private _publicPackageService: IPublicPackageService,
    @inject('IWishlistService')
    private _wishlistService: IWishlistService,
    @inject('IPublicVendorService')
    private _publicVendorService: IPublicVendorService,
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
    const userId = req.user.id;
    const { packageId } = req.params;

    const result = await this._wishlistService.toggleWishlist(userId, packageId);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getWishlistedIds = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await this._wishlistService.getWishlistedIds(userId);
    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page, limit } = getPaginationOptions(req);

    const result = await this._wishlistService.getWishlist(userId, page, limit);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getWishlistCount = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await this._wishlistService.getWishlistCount(userId);
    const successResponse: IApiResponse<{ count: number }> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: { count: result },
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendorPublicProfile = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const { page, limit } = getPaginationOptions(req);
    const result = await this._publicVendorService.getVendorPublicProfile(vendorId, page, limit);

    const successResponse: IApiResponse<VendorPublicProfileResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
