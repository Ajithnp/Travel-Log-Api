import { injectable, inject } from 'tsyringe';
import {
  IReviewRepository,
  VendorReviewFilters,
} from '../interfaces/repository_interfaces/IReviewRepository';
import {
  IPackageReviewsResponseDto,
  IReviewRequestDto,
  IReviewService,
  IReviewStatsResponseDto,
  VendorPackageReviewResponseDto,
} from '../interfaces/service_interfaces/IReviewService';
import { IBookingRepository } from '../interfaces/repository_interfaces/IBookingRepository';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { BOOKING_STATUS } from '../shared/constants/booking';
import { IReview, IReviewUserPopulated } from '../types/entities/review.entity';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { ReviewMapper } from '../shared/mappers/review.mapper';
import { IBasePackageRepository } from '../interfaces/repository_interfaces/IBasePackageRepository';
import { IVendorInfoRepository } from '../interfaces/repository_interfaces/IVendorInfoRepository';
import { PaginatedData } from '../types/common/IPaginationResponse';

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject('IReviewRepository')
    private _reviewRepository: IReviewRepository,
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('IBasePackageRepository')
    private _packageRepository: IBasePackageRepository,
    @inject('IVendorInfoRepository')
    private _vendorRepository: IVendorInfoRepository,
  ) {}

  async addReview(userId: string, reviewDto: IReviewRequestDto): Promise<void> {
    const booking = await this._bookingRepository.findOne({
      _id: toObjectId(reviewDto.bookingId),
      userId: toObjectId(userId),
    });
    if (!booking) {
      throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (booking.bookingStatus !== BOOKING_STATUS.COMPLETED) {
      throw new AppError(
        ERROR_MESSAGES.BOOKING_MUST_BE_COMPLETED_TO_REVIEW,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (booking.hasReviewed) {
      throw new AppError(ERROR_MESSAGES.REVIEW_ALREADY_EXIST, HTTP_STATUS.BAD_REQUEST);
    }

    const hasReview = await this._reviewRepository.findByPackageId(
      booking.packageId.toString(),
      userId,
    );
    if (hasReview && !hasReview.isDeleted) {
      throw new AppError(
        ERROR_MESSAGES.REVIEW_ALREADY_EXISTS_THIS_PACKAGE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const packageId = booking.packageId?._id?.toString() ?? booking.packageId.toString();
    const vendorId = booking.vendorId?._id?.toString() ?? booking.vendorId.toString();

    const reviewData: Partial<IReview> = {
      bookingId: toObjectId(reviewDto.bookingId),
      packageId: toObjectId(packageId),
      vendorId: toObjectId(vendorId),
      rating: reviewDto.rating,
      text: reviewDto.text,
      images: reviewDto.images,
      userId: toObjectId(userId),
    };

    await this._reviewRepository.create(reviewData);

    await this._bookingRepository.findOneAndUpdate(
      { _id: toObjectId(reviewDto.bookingId) },
      { hasReviewed: true },
    );

    const stats = await this._reviewRepository.getAverageRating(packageId);
    if (stats) {
      await this._packageRepository.findOneAndUpdate(
        { _id: toObjectId(packageId) },
        { averageRating: stats.average, totalReviews: stats.total },
      );
    }
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this._reviewRepository.findOne({
      _id: toObjectId(reviewId),
      userId: toObjectId(userId),
    });
    if (!review) {
      throw new AppError(ERROR_MESSAGES.REVIEW_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (review.userId.toString() !== userId) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_TO_DELETE_REVIEW, HTTP_STATUS.UNAUTHORIZED);
    }
    if (review.isDeleted) {
      throw new AppError(ERROR_MESSAGES.REVIEW_ALREADY_DELETED, HTTP_STATUS.BAD_REQUEST);
    }

    await this._reviewRepository.findOneAndUpdate(
      { _id: toObjectId(reviewId) },
      { isDeleted: true },
    );
    await this._bookingRepository.findOneAndUpdate(
      { _id: review.bookingId },
      { hasReviewed: false },
    );

    const packageId = review.packageId.toString();
    const stats = await this._reviewRepository.getAverageRating(packageId);
    if (stats) {
      await this._packageRepository.findOneAndUpdate(
        { _id: toObjectId(packageId) },
        { averageRating: stats.average, totalReviews: stats.total },
      );
    }
  }

  async getPackagePublicReviews(
    packageId: string,
    page: number,
    limit: number,
    userId?: string,
  ): Promise<IPackageReviewsResponseDto> {
    const packageExists = await this._packageRepository.findOne({ _id: toObjectId(packageId) });
    if (!packageExists) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    let userReview: IReviewUserPopulated | null = null;

    if (userId) {
      const userReviewed = await this._reviewRepository.findOnePopulated<IReviewUserPopulated>(
        { packageId: toObjectId(packageId), userId: toObjectId(userId) },
        { path: 'userId', select: 'name' },
      );

      if (userReviewed && !userReviewed.isDeleted) {
        userReview = userReviewed;
      }
    }

    const { reviews, total } = await this._reviewRepository.findAllByPackageId({
      packageId,
      page,
      limit,
      userId,
    });

    return {
      data: ReviewMapper.toPublicPackageResponse(userReview ? [userReview, ...reviews] : reviews),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
    };
  }

  async getPackageReviewsStats(packageId: string): Promise<IReviewStatsResponseDto> {
    const packageExists = await this._packageRepository.findOne({ _id: toObjectId(packageId) });
    if (!packageExists) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const statsData = await this._reviewRepository.getRatingStats(packageId);

    return statsData;
  }

  async getVendorPackagesReviwes(
    vendorId: string,
    filters: VendorReviewFilters,
  ): Promise<PaginatedData<VendorPackageReviewResponseDto>> {
    const vendorExists = await this._vendorRepository.findOne({ userId: toObjectId(vendorId) });
    if (!vendorExists) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const { reviews, total } = await this._reviewRepository.findAllByVendorId(vendorId, filters);
    return {
      data: ReviewMapper.toVendorPackageResponse(reviews),
      currentPage: filters.page,
      totalPages: Math.ceil(total / filters.limit),
      totalDocs: total,
      hasNextPage: filters.page * filters.limit < total,
    };
  }

  async getVendorPackagesReviwesStats(vendorId: string): Promise<IReviewStatsResponseDto> {
    const vendorExists = await this._vendorRepository.findOne({ userId: toObjectId(vendorId) });
    if (!vendorExists) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const statsData = await this._reviewRepository.getRatingStatsByVendorId(vendorId);
    return statsData;
  }
}
