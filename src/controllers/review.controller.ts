import { injectable, inject } from "tsyringe";
import { IReviewController } from "../interfaces/controller_interfaces/IReviewController";
import { IReviewRequestDto, IReviewService } from "../interfaces/service_interfaces/IReviewService";
import expressAsyncHandler from "express-async-handler";
import { IApiResponse } from "../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../shared/constants/messages";

@injectable()
export class ReviewController implements IReviewController {
  constructor(
    @inject('IReviewService')
    private _reviewService: IReviewService,
  ) {}
  
    addReview = expressAsyncHandler(async (req, res) => {
      const reviewDto : IReviewRequestDto = req.body;
    //   const userId = req.user?.id;
    const userId = '69197554ba5d1de9ba1b38b6'
      const result = await this._reviewService.addReview(userId,reviewDto);
  
      const successResponse: IApiResponse<typeof result> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: result,
      };
      res.status(HTTP_STATUS.CREATED).json(successResponse);
    });

}