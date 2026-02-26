import { inject, injectable } from 'tsyringe';
import { IAdminCategoryController } from '../../interfaces/controller_interfaces/admin/IAdminCategoryController';
import { IAdminCategoryService } from '../../interfaces/service_interfaces/admin/ICategoryService';
import asyncHandler from 'express-async-handler';
import { IApiResponse } from '../../types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';

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
}
