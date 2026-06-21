import { injectable, inject } from 'tsyringe';
import { IReviewController } from '../interfaces/controller_interfaces/IReviewController';
import { IReviewRequestDto, IReviewService } from '../interfaces/service_interfaces/IReviewService';
import expressAsyncHandler from 'express-async-handler';
import { IApiResponse } from '../types/common/IApiResponse';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import { getPaginationOptions } from '../shared/utils/pagination.helper';
import { ReviewSortBy, VendorReviewFilters } from '../interfaces/repository_interfaces/IReviewRepository';

@injectable()
export class ReviewController implements IReviewController {
  constructor(
    @inject('IReviewService')
    private _reviewService: IReviewService,
  ) {}

  addReview = expressAsyncHandler(async (req, res) => {
    const reviewDto: IReviewRequestDto = req.body;
    const userId = req.user?.id;

    const result = await this._reviewService.addReview(userId, reviewDto);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  deleteReview = expressAsyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user?.id;

    const result = await this._reviewService.deleteReview(reviewId, userId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackagePublicReviews = expressAsyncHandler(async (req, res) => {
    const { page, limit } = getPaginationOptions(req);
    const packageId = req.params.packageId;
    const userId = req.user?.id as string | undefined;

    const result = await this._reviewService.getPackagePublicReviews(
      packageId,
      page,
      limit,
      userId,
    );

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getPackageReviewsStats = expressAsyncHandler(async (req, res) => {
    const packageId = req.params.packageId;

    const result = await this._reviewService.getPackageReviewsStats(packageId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendorPackagesReviwes= expressAsyncHandler(async (req, res) => {
    const vendorId = req.user?.id;
    const { page, limit } = getPaginationOptions(req);
    const {packageId} = req.query as {packageId?:string};
    const {rating} = req.query as {rating?:string};
    const {sortBy} = req.query as {sortBy?:ReviewSortBy};

    const reviewFilter : VendorReviewFilters = {
      page:page,
      limit:limit,
      packageId:packageId,
      rating:rating,
      sortBy:sortBy
    }

    const result = await this._reviewService.getVendorPackagesReviwes(vendorId, reviewFilter);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getVendorPackagesReviwesStats= expressAsyncHandler(async (req, res) => {
    const vendorId = req.user?.id;

    const result = await this._reviewService.getVendorPackagesReviwesStats(vendorId);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
