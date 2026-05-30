import { IPackageReviewSinglesResponseDto } from "../../interfaces/service_interfaces/IReviewService";
import { IReviewUserPopulated } from "../../types/entities/review.entity";

export class ReviewMapper {
  static toPublicPackageResponse(reviews: IReviewUserPopulated[]): IPackageReviewSinglesResponseDto[] {
    return reviews.map((review) => ({
      userName: review.userId.name,
      createdAt: review.createdAt,
      rating: review.rating,
      text: review.text,
      images: review.images,
    }));
  }
}