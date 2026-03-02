import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ICategory, ICategoryRequestPopulated } from '../types/entities/category.entity';
import { CategoryModel } from '../models/category.model';
import { ICategoryRepository, PaginatedVendorCategoryResult } from '../interfaces/repository_interfaces/ICategoryRepository';
import mongoose from 'mongoose';
import {
  APPROVE_REJECT_ACTIONS,
  CATEGORY_STATUS,
  CategoryStatus,
} from '../shared/constants/constants';
import { CategoryFilters, CategoryFindAllResult, FilterType } from '../types/db';
import { ReviewRequestDTO } from 'types/dtos/admin/request.dtos';

@injectable()
export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findByName(name: string): Promise<ICategory | null> {
    return this.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    }) as Promise<ICategory | null>;
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return this.findOne({ slug: slug.toLowerCase() }) as Promise<ICategory | null>;
  }

  async toggleStatus(
    id: string,
    isActive: boolean,
    status: CategoryStatus,
  ): Promise<ICategory | null> {
    return this.findByIdAndUpdate(
      id,
      { $set: { isActive, status } },
      { new: true },
    ) as Promise<ICategory | null>;
  }

  async findAllCategory(filters: CategoryFilters): Promise<CategoryFindAllResult> {
    const searchMatch: mongoose.FilterQuery<ICategory> = {};

    if (filters.search?.trim()) {
      searchMatch.name = { $regex: new RegExp(filters.search.trim(), 'i') };
    }

    let isActiveFilter: mongoose.FilterQuery<ICategory> = {};
    if (!filters?.status) {
      isActiveFilter.status = [CATEGORY_STATUS.ACTIVE, CATEGORY_STATUS.INACTIVE];
    } else {
      isActiveFilter.status = [filters.status];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [result] = await this.model.aggregate([
      { $match: searchMatch },

      {
        $facet: {
          // Branch 1: paginated list — only approved + dropdown filter
          categories: [
            {
              $match: {
                status: { $in: [...isActiveFilter.status] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: filters.limit },
          ],

          // Branch 2: total for pagination — respects dropdown filter
          totalCount: [
            {
              $match: {
                status: { $in: [...isActiveFilter.status] },
              },
            },
            { $count: 'count' },
          ],

          // Branch 3: global stats — sees ALL statuses, unaffected by dropdown
          stats: [
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', [CATEGORY_STATUS.ACTIVE, CATEGORY_STATUS.INACTIVE]] },
                      1,
                      0,
                    ],
                  },
                },
                active: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$status', CATEGORY_STATUS.ACTIVE] },
                          { $eq: ['$isActive', true] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                inactive: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$status', CATEGORY_STATUS.INACTIVE] },
                          { $eq: ['$isActive', false] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pendingApproval: {
                  $sum: { $cond: [{ $eq: ['$status', CATEGORY_STATUS.PENDING] }, 1, 0] },
                },
              },
            },
          ],
        },
      },

      {
        $project: {
          categories: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
          stats: {
            total: { $ifNull: [{ $arrayElemAt: ['$stats.total', 0] }, 0] },
            active: { $ifNull: [{ $arrayElemAt: ['$stats.active', 0] }, 0] },
            inactive: { $ifNull: [{ $arrayElemAt: ['$stats.inactive', 0] }, 0] },
            pendingApproval: { $ifNull: [{ $arrayElemAt: ['$stats.pendingApproval', 0] }, 0] },
          },
        },
      },
    ]);

    return {
      categories: result.categories as ICategory[],
      total: result.total,
      stats: result.stats,
    };
  }

  async findPendingRequests(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ requests: ICategoryRequestPopulated[]; total: number }> {
    const query: mongoose.FilterQuery<ICategory> = {
      status: CATEGORY_STATUS.PENDING,
    };

    if (search?.trim()) {
      query.name = { $regex: new RegExp(search.trim(), 'i') };
    }
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.model
        .find(query)
        .populate<{ requestedBy: { _id: string; name: string; email: string } }>(
          'requestedBy',
          'name email',
        ) // vendor info
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean<ICategoryRequestPopulated[]>(),
      CategoryModel.countDocuments(query),
    ]);

    return { requests, total };
  }

  async reviewRequest(id: string, data: ReviewRequestDTO): Promise<ICategory | null> {
    const updateData: Partial<ICategory> = {
      status: data.status as CategoryStatus,
      isActive: data.isActive,
      createdBy: new mongoose.Types.ObjectId(data.adminId), // admin who reviewed
    };

    if (data.status === APPROVE_REJECT_ACTIONS.REJECT && data.rejectionReason) {
      updateData.rejectionReason = data.rejectionReason;
    } else {
      updateData.slug = data.slug;
    }

    return this.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    ) as Promise<ICategory | null>;
  }

  async findReviewedRequest(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<{ requests: ICategoryRequestPopulated[]; total: number }> {
    const query: mongoose.FilterQuery<ICategory> = {
      status: selectedFilter
        ? selectedFilter
        : { $in: [CATEGORY_STATUS.REJECTED, CATEGORY_STATUS.ACTIVE] },
      requestedBy: { $ne: null },
    };

    if (search?.trim()) {
      query.name = { $regex: new RegExp(search.trim(), 'i') };
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.model
        .find(query)
        .populate<{
          requestedBy: { _id: string; name: string; email: string };
        }>('requestedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ICategoryRequestPopulated[]>(),
      this.model.countDocuments(query),
    ]);

    return { requests, total };
  }

  async findVendorCategory(vendorId: string, filter: FilterType): Promise<PaginatedVendorCategoryResult> {
    const query: mongoose.FilterQuery<ICategory> = {
      requestedBy: new mongoose.Types.ObjectId(vendorId),
      status: CATEGORY_STATUS.PENDING
    };

    if (filter.search?.trim()) {
      query.name = { $regex: new RegExp(filter.search.trim(), 'i') };
    }

    if (filter.selectedFilter) {
      query.status = filter.selectedFilter
    }
    
    const skip = (filter.page - 1) * filter.limit;

      const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(filter.limit)
        .lean<ICategory[]>(),
        
      this.model.countDocuments(query),
    ]);

   return {data ,total };

  }
}
