import { PaginatedData } from '../../types/common/IPaginationResponse';
import { IFile } from '../../types/entities/base-package.entity';
import { IRatingStatsSummary } from '../../interfaces/repository_interfaces/IReviewRepository';

export interface IReviewService {
  addReview: (userId: string, reviewDto: IReviewRequestDto) => Promise<void>;
  deleteReview: (reviewId: string, userId: string) => Promise<void>;
  getPackagePublicReviews(
    packageId: string,
    page: number,
    limit: number,
    userId?: string,
  ): Promise<IPackageReviewsResponseDto>;
  getPackageReviewsStats(packageId: string): Promise<IReviewStatsResponseDto>;
}

export interface IReviewRequestDto {
  bookingId: string;
  rating: number;
  text: string;
  images?: IFile[];
}

export type IPackageReviewsResponseDto = PaginatedData<IPackageReviewSinglesResponseDto>;

export interface IPackageReviewSinglesResponseDto {
  id: string;
  userId: string;
  userName: string;
  createdAt: Date;
  rating: number;
  text: string;
  images?: IFile[];
}

export type IReviewStatsResponseDto = IRatingStatsSummary;
