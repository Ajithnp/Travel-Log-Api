import { inject, injectable } from 'tsyringe';
import { IAdminCategoryController } from '../../interfaces/controller_interfaces/admin/IAdminCategoryController';
import { IAdminCategoryService } from '../../interfaces/service_interfaces/admin/ICategoryService';
import asyncHandler from 'express-async-handler';
import { IApiResponse } from '../../types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { getPaginationOptions } from '../../shared/utils/pagination.helper';
import { CategoryFilters } from '../../types/db';
import { CategoryStatus } from '../../shared/constants/constants';
import { APPROVE_REJECT_ACTIONS } from '../../shared/constants/constants';

@injectable()
export class AdminCategoryController implements IAdminCategoryController {
  constructor(
    @inject('IAdminCategoryService')
    private _adminCategoryService: IAdminCategoryService,
  ) {}

  createCategory = asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const payload = req.body;
    await this._adminCategoryService.createCategory(adminId, payload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.CATEGORY_CREATED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const adminId = req.user.id;
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
    const isActivated = await this._adminCategoryService.toggleCategoryStatus(id);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: isActivated
        ? SUCCESS_MESSAGES.CATEGORY_ACTIVATED
        : SUCCESS_MESSAGES.CATEGORY_DEACTIVATED,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getAllCategories = asyncHandler(async (req, res) => {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);
    const filters: CategoryFilters = {
      status: selectedFilter as CategoryStatus,
      search,
      page,
      limit,
    };

    const result = await this._adminCategoryService.getAllCategories(filters);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPendingRequest = asyncHandler(async (req, res) => {
    const { page, limit, search } = getPaginationOptions(req);

    const result = await this._adminCategoryService.getPendingRequests(page, limit, search);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  reviewCategoryRequest = asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    await this._adminCategoryService.reviewCategoryRequest(adminId, id, {
      action,
      rejectionReason,
    });

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message:
        action === APPROVE_REJECT_ACTIONS.APPROVE
          ? SUCCESS_MESSAGES.CATEGORY_REQUEST_APPROVED
          : SUCCESS_MESSAGES.CATEGORY_REQUEST_REJECTED,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getReviwedRequest = asyncHandler(async (req, res) => {
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);

    const result = await this._adminCategoryService.getReviewedRequests(
      page,
      limit,
      search,
      selectedFilter,
    );

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
