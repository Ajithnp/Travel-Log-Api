import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IVendorPackageController } from '../../interfaces/controller_interfaces/vendor/IVendorPackageController';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { IPackageService } from '../../interfaces/service_interfaces/vendor/IPackageService';
import { IApiResponse } from '../../types/common/IApiResponse';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import { CreateBasePackageDTO } from '../../validators/vendor/package/base-package.schema';
import { FilterType } from '../../types/db';

@injectable()
export class VendorPackageController implements IVendorPackageController {
  constructor(
    @inject('IPackageService')
    private _packageService: IPackageService,
  ) {}

  createPackage = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const payload: CreateBasePackageDTO = req.body;

    const { packageId } = await this._packageService.createPackage(vendorId, payload);

    const successResponse: IApiResponse<typeof packageId> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PACKAGE_CREATION_SUCCESS,
      data: packageId,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  updatePackage = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { packageId } = req.params;
    const payload = req.body;

    await this._packageService.updatePackage(vendorId, packageId, payload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PACKAGE_UPDATION_SUCCESS,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  fetchPackages = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);
    const filters: FilterType = {
      page,
      limit,
      search,
      selectedFilter,
    };
    const packages = await this._packageService.fetchPackages(vendorId, filters);
    const successResponse: IApiResponse<typeof packages> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: packages,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  fetPackagesWithId = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    const packages = await this._packageService.fetchPackagesWithId(vendorId, id);

    const successResponse: IApiResponse<typeof packages> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: packages,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackageScheduleContext = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { id } = req.params;

    const pkg = await this._packageService.fetchPackageScheduleContext(vendorId, id);

    const successResponse: IApiResponse<typeof pkg> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: pkg,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
