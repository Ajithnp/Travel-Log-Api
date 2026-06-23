import {
  IPackageReviewSinglesResponseDto,
  VendorPackageReviewResponseDto,
} from '../../interfaces/service_interfaces/IReviewService';
import { IReviewDetailsPopulated, IReviewUserPopulated } from '../../types/entities/review.entity';

export class ReviewMapper {
  static toPublicPackageResponse(
    reviews: IReviewUserPopulated[],
  ): IPackageReviewSinglesResponseDto[] {
    return reviews.map((review) => ({
      id: review._id.toString(),
      userId: review.userId._id.toString(),
      userName: review.userId.name,
      createdAt: review.createdAt,
      rating: review.rating,
      text: review.text,
      images: review.images || [],
    }));
  }

  static toVendorPackageResponse(
    reviews: IReviewDetailsPopulated[],
  ): VendorPackageReviewResponseDto[] {
    return reviews.map((review) => ({
      id: review._id.toString(),
      packageName: review.packageId.title,
      userName: review.userId.name,
      createdAt: review.createdAt,
      rating: review.rating,
      text: review.text,
      images: review.images || [],
    }));
  }
}
