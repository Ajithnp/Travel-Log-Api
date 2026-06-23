import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import {
  IReview,
  IReviewDetailsPopulated,
  IReviewUserPopulated,
} from '../types/entities/review.entity';
import {
  IRatingStatsSummary,
  IReviewRepository,
  PublicReviewFilters,
  VendorReviewFilters,
} from '../interfaces/repository_interfaces/IReviewRepository';
import { ReviewModel } from '../models/review.model';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { FilterQuery } from 'mongoose';

@injectable()
export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
  constructor() {
    super(ReviewModel);
  }

  private buildSortStage(sort?: string): Record<string, 1 | -1> {
    switch (sort) {
      case 'latest':
        return { createdAt: -1 };
      case 'oldest':
        return { createdAt: 1 };
      case 'ratingHigh':
        return { rating: -1 };
      case 'ratingLow':
        return { rating: 1 };
      default:
        return { createdAt: -1 };
    }
  }

  async findByPackageId(packageId: string, userId: string): Promise<IReview | null> {
    return await this.findOne({ packageId, userId });
  }

  async getRatingStats(packageId: string): Promise<IRatingStatsSummary> {
    const result = await this.model.aggregate([
      {
        $match: {
          packageId: toObjectId(packageId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
          count1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          count2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          count3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          count4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          count5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    if (!result[0]) {
      return { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const data = result[0];
    return {
      average: Math.round(data.average * 10) / 10,
      total: data.total,
      breakdown: { 1: data.count1, 2: data.count2, 3: data.count3, 4: data.count4, 5: data.count5 },
    };
  }

  async getRatingStatsByVendorId(vendorId: string): Promise<IRatingStatsSummary> {
    const result = await this.model.aggregate([
      {
        $match: {
          vendorId: toObjectId(vendorId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
          count1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          count2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          count3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          count4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          count5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    if (!result[0]) {
      return { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const data = result[0];
    return {
      average: Math.round(data.average * 10) / 10,
      total: data.total,
      breakdown: { 1: data.count1, 2: data.count2, 3: data.count3, 4: data.count4, 5: data.count5 },
    };
  }

  async getAverageRating(packageId: string): Promise<{ average: number; total: number }> {
    const result = await this.model.aggregate([
      { $match: { packageId: toObjectId(packageId), isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (!result[0]) {
      return { average: 0, total: 0 };
    }
    const data = result[0];
    return { average: Math.round(data.avgRating), total: data.count };
  }

  async findAllByPackageId(filters: PublicReviewFilters): Promise<{
    reviews: IReviewUserPopulated[];
    total: number;
  }> {
    const query: FilterQuery<IReview> = {
      packageId: toObjectId(filters.packageId),
      isDeleted: false,
    };
    if (filters.userId) {
      query.userId = { $ne: filters.userId };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [reviews, total] = await Promise.all([
      this.model
        .find(query)
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return { reviews: reviews as unknown as IReviewUserPopulated[], total };
  }

  async findAllByVendorId(
    vendorId: string,
    filters: VendorReviewFilters,
  ): Promise<{ reviews: IReviewDetailsPopulated[]; total: number }> {
    let query: FilterQuery<IReview> = {
      vendorId: toObjectId(vendorId),
      isDeleted: false,
    };

    if (filters.packageId) {
      query.packageId = toObjectId(filters.packageId);
    }

    if (filters.rating) {
      query.rating = Number(filters.rating);
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [reviews, total] = await Promise.all([
      this.model
        .find(query)
        .populate('userId', 'name')
        .populate('packageId', 'title')
        .sort(this.buildSortStage(filters.sortBy))
        .skip(skip)
        .limit(filters.limit)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return { reviews: reviews as unknown as IReviewDetailsPopulated[], total };
  }
}
