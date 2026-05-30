import { injectable, inject } from "tsyringe";
import { IReviewController } from "../interfaces/controller_interfaces/IReviewController";
import { IReviewRequestDto, IReviewService } from "../interfaces/service_interfaces/IReviewService";
import expressAsyncHandler from "express-async-handler";
import { IApiResponse } from "../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../shared/constants/messages";
import { getPaginationOptions } from "shared/utils/pagination.helper";

@injectable()
export class ReviewController implements IReviewController {
  constructor(
    @inject('IReviewService')
    private _reviewService: IReviewService,
  ) {}
  
    addReview = expressAsyncHandler(async (req, res) => {
      const reviewDto : IReviewRequestDto = req.body;
      const userId = req.user?.id;
  
      const result = await this._reviewService.addReview(userId,reviewDto);
  
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
  
      const result = await this._reviewService.deleteReview(reviewId,userId);
  
      const successResponse: IApiResponse<typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: result,
      };
      res.status(HTTP_STATUS.CREATED).json(successResponse);
    });

    getPackagePublicReviews = expressAsyncHandler(async (req, res) => {
        const {page, limit} = getPaginationOptions(req);
      const packageId = req.params.packageId;

      const result = await this._reviewService.getPackagePublicReviews(packageId,page,limit);
  
      const successResponse: IApiResponse<typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: result,
      };
      res.status(HTTP_STATUS.CREATED).json(successResponse);
    });

    getPackageReviewsStats = expressAsyncHandler(async (req, res) => {
      const packageId = req.params.packageId;

      const result = await this._reviewService.getPackageReviewsStats(packageId);
  
      const successResponse: IApiResponse<typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: result,
      };
      res.status(HTTP_STATUS.CREATED).json(successResponse);
    });



}