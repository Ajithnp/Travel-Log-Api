import { IBaseRepository } from './IBaseRepository';
import {
  IReview,
  IReviewDetailsPopulated,
  IReviewUserPopulated,
} from '../../types/entities/review.entity';

export interface IReviewRepository extends IBaseRepository<IReview> {
  findByPackageId(packageId: string, userId: string): Promise<IReview | null>;

  getRatingStats(packageId: string): Promise<IRatingStatsSummary>;

  getRatingStatsByVendorId(vendorId: string): Promise<IRatingStatsSummary>;

  getAverageRating(packageId: string): Promise<{ average: number; total: number }>;

  findAllByPackageId(
    filters: PublicReviewFilters,
  ): Promise<{ reviews: IReviewUserPopulated[]; total: number }>;

  findAllByVendorId(
    vendorId: string,
    filters: VendorReviewFilters,
  ): Promise<{ reviews: IReviewDetailsPopulated[]; total: number }>;
}

export interface PublicReviewFilters {
  packageId: string;
  page: number;
  limit: number;
  userId?: string;
}

export interface IRatingStatsSummary {
  average: number;
  total: number;
  breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export type ReviewSortBy = 'latest' | 'oldest' | 'ratingHigh' | 'ratingLow';

export interface VendorReviewFilters {
  page: number;
  limit: number;
  search?: string;
  packageId?: string;
  rating?: string;
  sortBy?: ReviewSortBy;
}
