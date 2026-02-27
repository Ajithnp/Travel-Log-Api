import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ICategory } from '../types/entities/category.entity';
import { CategoryModel } from '../models/category.model';
import { ICategoryRepository } from '../interfaces/repository_interfaces/ICategoryRepository';
import mongoose from 'mongoose';
import { CATEGORY_STATUS, CategoryStatus } from '../shared/constants/constants';
import { CategoryFilters, CategoryFindAllResult } from '../types/db';

@injectable()
export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findByName(name: string): Promise<ICategory | null> {
    return CategoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    }).lean() as Promise<ICategory | null>;
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return CategoryModel.findOne({ slug: slug.toLowerCase() }).lean() as Promise<ICategory | null>;
  }

  async toggleStatus(
    id: string,
    isActive: boolean,
    status: CategoryStatus,
  ): Promise<ICategory | null> {
    return CategoryModel.findByIdAndUpdate(
      id,
      { $set: { isActive, status } },
      { new: true },
    ).lean() as Promise<ICategory | null>;
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

    const [result] = await CategoryModel.aggregate([
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
}
