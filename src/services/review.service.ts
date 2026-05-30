import { injectable, inject } from "tsyringe";
import { IReviewRepository } from "../interfaces/repository_interfaces/IReviewRepository";
import { IReviewRequestDto, IReviewService } from "../interfaces/service_interfaces/IReviewService";
import { IBookingRepository } from "../interfaces/repository_interfaces/IBookingRepository";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../shared/constants/http_status_code";
import { ERROR_MESSAGES } from "../shared/constants/messages";
import { BOOKING_STATUS } from "../shared/constants/booking";
import { IReview } from "../types/entities/review.entity";
import { toObjectId } from "../shared/utils/database/objectId.helper";

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject('IReviewRepository')
    private _reviewRepository: IReviewRepository,
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
  ) {}

  async addReview(userId:string,reviewDto:IReviewRequestDto):Promise<void>{
   
    const booking = await this._bookingRepository.findOne({_id:toObjectId(reviewDto.bookingId), userId:toObjectId(userId)})
    if (!booking) {
      throw new AppError('Booking not found.', HTTP_STATUS.NOT_FOUND)
    };
    if(booking.bookingStatus !== BOOKING_STATUS.COMPLETED){
      throw new AppError('Booking must be completed to review.', HTTP_STATUS.BAD_REQUEST)
    };
    if(booking.hasReviewed){
        throw new AppError('You have already submitted a review for this booking.', HTTP_STATUS.BAD_REQUEST)
    };

    const hasReview = await this._reviewRepository.findByPackageId(booking.packageId.toString(),userId);
    if (hasReview && !hasReview.isDeleted) {
      throw new AppError('Review already exists for this booking.', HTTP_STATUS.BAD_REQUEST);
    }

    const packageId = booking.packageId?._id?.toString() ?? booking.packageId.toString();
    const vendorId  = booking.vendorId?._id?.toString()  ?? booking.vendorId.toString();

    const reviewData : Partial<IReview>={
        bookingId:toObjectId(reviewDto.bookingId),
        packageId:toObjectId(packageId),
        vendorId:toObjectId(vendorId),
        rating:reviewDto.rating,
        text:reviewDto.text,
        images:reviewDto.images,
        userId:toObjectId(userId),
    }

    await this._reviewRepository.create(reviewData);
    await this._bookingRepository.findOneAndUpdate({_id:toObjectId(reviewDto.bookingId)},{hasReviewed:true});
  };

  async deleteReview(reviewId:string,userId:string):Promise<void>{

    const review = await this._reviewRepository.findOne({_id:toObjectId(reviewId), userId:toObjectId(userId)})
    if (!review) {
      throw new AppError('Review not found.', HTTP_STATUS.NOT_FOUND)
    };
    if(review.userId.toString() !== userId){
        throw new AppError('You are not authorized to delete this review.', HTTP_STATUS.UNAUTHORIZED)
    };
    if(review.isDeleted){
      throw new AppError('This review has already been deleted.', HTTP_STATUS.BAD_REQUEST)
    };

    await this._reviewRepository.findOneAndUpdate({_id:toObjectId(reviewId)},{isDeleted:true});
    await this._bookingRepository.findOneAndUpdate({_id:review.bookingId},{hasReviewed:false});
  };

}