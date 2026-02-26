import { inject, injectable } from 'tsyringe';
import { IAdminCategoryController } from '../../interfaces/controller_interfaces/admin/IAdminCategoryController';
import { IAdminCategoryService } from '../../interfaces/service_interfaces/admin/ICategoryService';
import asyncHandler from 'express-async-handler';
import { IApiResponse } from '../../types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

@injectable()
export class AdminCategoryController implements IAdminCategoryController {
  constructor(
    @inject('IAdminCategoryService')
    private _adminCategoryService: IAdminCategoryService,
  ) {}

  createCategory = asyncHandler(async (req, res) => {
    const adminId = req.user?.id!;
    const payload = req.body;
    await this._adminCategoryService.createCategory(adminId, payload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.CATEGORY_CREATED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const adminId = req.user?.id!;
    const { id } = req.params;
    const payload = req.body;
    await this._adminCategoryService.updateCategory(adminId, id, payload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.CATEGORY_UPDATED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  toggleCategoryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log('id')
    const isActivated = await this._adminCategoryService.toggleCategoryStatus(id);
   console.log('actate', isActivated)
    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: isActivated
        ? SUCCESS_MESSAGES.CATEGORY_ACTIVATED
        : SUCCESS_MESSAGES.CATEGORY_DEACTIVATED,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
