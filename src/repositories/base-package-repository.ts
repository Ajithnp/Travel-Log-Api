import { injectable } from 'tsyringe';
import {
  IBasePackageRepository,
  RawPublicPackageDocument,
} from '../interfaces/repository_interfaces/IBasePackageRepository';
import { BaseRepository } from './base.repository';
import { IBasePackageEntity, IBasePackagePopulated } from '../types/entities/base-package.entity';
import { PackageModel } from '../models/package.model';
import { FilterType, PublicPackageFilters } from '../types/db';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { MongoNumberRange } from '../types/db';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../shared/constants/constants';
import { toObjectId } from '../shared/utils/database/objectId.helper';

@injectable()
export class BasePackageRepository
  extends BaseRepository<IBasePackageEntity>
  implements IBasePackageRepository
{
  constructor() {
    super(PackageModel);
  }

  private buildSortStage(sort?: string): Record<string, 1 | -1> {
    switch (sort) {
      case 'price_low_high':
        return { startingFromPrice: 1 };
      case 'price_high_low':
        return { startingFromPrice: -1 };
      case 'newest':
        return { earliestDate: 1 };
      case 'top_rated':
        return { averageRating: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  async findPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<{ requests: IBasePackagePopulated[]; total: number }> {
    const query: mongoose.FilterQuery<IBasePackageEntity> = {
      vendorId,
    };

    if (filters.search?.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ location: { $regex: regex } }, { state: { $regex: regex } }];
    }
    if (filters.selectedFilter?.trim()) {
      query.status = filters.selectedFilter;
    }
    const skip = (filters.page - 1) * filters.limit;

    const [requests, total] = await Promise.all([
      this.model
        .find(query)
        .populate<{ categoryId: { name: string } }>('categoryId', 'name')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(filters.limit)
        .lean<IBasePackagePopulated[]>(),

      this.countDocuments(query),
    ]);

    return { requests, total };
  }

  async findPublicPackages(
    filters: PublicPackageFilters,
  ): Promise<{ packages: RawPublicPackageDocument[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const pipeline: mongoose.PipelineStage[] = [];

    // ── Stage 1: Base match ─────────────────────
    const matchStage: FilterQuery<IBasePackageEntity> = {
      status: PACKAGE_STATUS.PUBLISHED,
      isActive: true,
    };

    if (filters.difficulty) {
      matchStage.difficultyLevel = filters.difficulty;
    }

    if (filters.search?.trim()) {
      const regex = { $regex: filters.search.trim(), $options: 'i' };
      matchStage.$or = [{ state: regex }, { location: regex }];
    }

    pipeline.push({ $match: matchStage });

    pipeline.push({
      $addFields: {
        daysNum: { $toInt: '$days' },
      },
    });

    if (filters.minDuration || filters.maxDuration) {
      const durationMatch: MongoNumberRange = {};

      if (filters.minDuration) durationMatch.$gte = Number(filters.minDuration);
      if (filters.maxDuration) durationMatch.$lte = Number(filters.maxDuration);

      pipeline.push({ $match: { daysNum: durationMatch } });
    }

    // ── Stage 2: Category lookup + filter ─────────────
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryData',
      },
    });

    pipeline.push({
      $addFields: {
        category: { $arrayElemAt: ['$categoryData', 0] },
      },
    });

    if (filters.category) {
      pipeline.push({
        $match: {
          $or: [
            { 'category.slug': filters.category },
            ...(mongoose.Types.ObjectId.isValid(filters.category)
              ? [{ categoryId: new mongoose.Types.ObjectId(filters.category) }]
              : []),
          ],
        },
      });
    }

    // ── Stage 3: Join schedules ───────────────────
    pipeline.push({
      $lookup: {
        from: 'schedulepackages',
        let: { pkgId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$packageId', '$$pkgId'] },
                  { $in: ['$status', [SCHEDULE_STATUS.UPCOMING, SCHEDULE_STATUS.SOLD_OUT]] },
                  ...(filters.startDate
                    ? [{ $gte: ['$startDate', new Date(filters.startDate)] }]
                    : []),
                  ...(filters.endDate ? [{ $lte: ['$startDate', new Date(filters.endDate)] }] : []),
                ],
              },
            },
          },
          { $sort: { startDate: 1 } },
          {
            $project: {
              pricing: 1,
              startDate: 1,
              endDate: 1,
              status: 1,
            },
          },
        ],
        as: 'activeSchedules',
      },
    });

    // ── Stage 4: Remove packages with no active schedules ───────────────
    pipeline.push({
      $match: { 'activeSchedules.0': { $exists: true } },
    });

    // ── Stage 5: Compute derived fields ──────────
    pipeline.push({
      $addFields: {
        startingFromPrice: {
          $min: {
            $map: {
              input: '$activeSchedules',
              as: 'sc',
              in: {
                $let: {
                  vars: {
                    soloTier: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$$sc.pricing',
                            as: 'p',
                            cond: { $eq: ['$$p.type', 'SOLO'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: '$$soloTier.price',
                },
              },
            },
          },
        },

        earliestDate: { $min: '$activeSchedules.startDate' },

        earliestEndDate: {
          $let: {
            vars: {
              earliestSchedule: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$activeSchedules',
                      as: 'sc',
                      cond: {
                        $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                      },
                    },
                  },
                  0,
                ],
              },
            },
            in: '$$earliestSchedule.endDate',
          },
        },

        earliestScheduleStatus: {
          $let: {
            vars: {
              earliestSchedule: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$activeSchedules',
                      as: 'sc',
                      cond: {
                        $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                      },
                    },
                  },
                  0,
                ],
              },
            },
            in: '$$earliestSchedule.status',
          },
        },

        scheduleCount: {
          $size: {
            $filter: {
              input: '$activeSchedules',
              as: 'sc',
              cond: {
                $in: ['$$sc.status', [SCHEDULE_STATUS.UPCOMING, SCHEDULE_STATUS.SOLD_OUT]],
              },
            },
          },
        },

        isSoldOut: {
          $eq: [
            {
              $size: {
                $filter: {
                  input: '$activeSchedules',
                  as: 'sc',
                  cond: { $eq: ['$$sc.status', SCHEDULE_STATUS.SOLD_OUT] },
                },
              },
            },
            { $size: '$activeSchedules' },
          ],
        },
      },
    });

    // ── Stage 6: Price range filter ─────────────────
    const minPrice = filters.minPrice !== undefined ? Number(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice !== undefined ? Number(filters.maxPrice) : undefined;

    const hasMinPrice = minPrice !== undefined && minPrice > 0;
    const hasMaxPrice = maxPrice !== undefined;

    if (hasMinPrice || hasMaxPrice) {
      const priceMatch: MongoNumberRange = {};
      if (hasMinPrice) priceMatch.$gte = minPrice;
      if (hasMaxPrice) priceMatch.$lte = maxPrice;
      pipeline.push({ $match: { startingFromPrice: priceMatch } });
    }

    // ── Stage 7: Rating filter ─────────────────────────
    if (filters.minRating !== undefined) {
      pipeline.push({
        $match: { averageRating: { $gte: filters.minRating } },
      });
    }

    // ── Stage 8: Vendor lookup ─────────────────
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendorData',
        pipeline: [{ $project: { name: 1 } }],
      },
    });

    pipeline.push({
      $addFields: {
        vendor: { $arrayElemAt: ['$vendorData', 0] },
      },
    });

    // ── Stage 9: Facet — count + sort + paginate + project ──────────────
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: this.buildSortStage(filters.sort) },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              title: 1,
              description: 1,
              location: 1,
              state: 1,
              difficultyLevel: 1,
              days: 1,
              nights: 1,
              usp: 1,
              images: { $slice: ['$images', 1] },
              category: { _id: 1, name: 1, slug: 1, icon: 1 },
              vendor: { _id: 1, name: 1 },
              startingFromPrice: 1,
              earliestDate: 1,
              earliestEndDate: 1,
              earliestScheduleStatus: 1,
              scheduleCount: 1,
              isSoldOut: 1,
              averageRating: 1,
              totalReviews: 1,
            },
          },
        ],
      },
    });

    const [result] = await this.model.aggregate(pipeline);

    const total = result.metadata[0]?.total ?? 0;
    const packages = result.data ?? [];

    return { packages, total };
  }

  // ─── Vendor Public Profile — packages by a single vendor ─────────────────
  async findVendorPublicPackages(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{ packages: RawPublicPackageDocument[]; total: number }> {
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const pipeline: mongoose.PipelineStage[] = [
      // ── Stage 1: Match this vendor's published + active packages ──────────
      {
        $match: {
          vendorId: vendorObjectId,
          status: PACKAGE_STATUS.PUBLISHED,
          isActive: true,
        },
      },

      // ── Stage 2: Category lookup ────────────────
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$categoryData', 0] },
        },
      },

      // ── Stage 3: Join active schedules ───────────────────
      {
        $lookup: {
          from: 'schedulepackages',
          let: { pkgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$packageId', '$$pkgId'] },
                    { $in: ['$status', [SCHEDULE_STATUS.UPCOMING, SCHEDULE_STATUS.SOLD_OUT]] },
                  ],
                },
              },
            },
            { $sort: { startDate: 1 } },
            { $project: { pricing: 1, startDate: 1, endDate: 1, status: 1 } },
          ],
          as: 'activeSchedules',
        },
      },

      // ── Stage 4: Drop packages with no active schedules ───────────────────
      { $match: { 'activeSchedules.0': { $exists: true } } },

      // ── Stage 5: Compute derived price / date / status fields ─────────────
      {
        $addFields: {
          startingFromPrice: {
            $min: {
              $map: {
                input: '$activeSchedules',
                as: 'sc',
                in: {
                  $let: {
                    vars: {
                      soloTier: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$$sc.pricing',
                              as: 'p',
                              cond: { $eq: ['$$p.type', 'SOLO'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: '$$soloTier.price',
                  },
                },
              },
            },
          },

          earliestDate: { $min: '$activeSchedules.startDate' },

          earliestEndDate: {
            $let: {
              vars: {
                earliestSchedule: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$activeSchedules',
                        as: 'sc',
                        cond: {
                          $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: '$$earliestSchedule.endDate',
            },
          },

          earliestScheduleStatus: {
            $let: {
              vars: {
                earliestSchedule: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$activeSchedules',
                        as: 'sc',
                        cond: {
                          $eq: ['$$sc.startDate', { $min: '$activeSchedules.startDate' }],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              in: '$$earliestSchedule.status',
            },
          },

          scheduleCount: { $size: '$activeSchedules' },

          isSoldOut: {
            $eq: [
              {
                $size: {
                  $filter: {
                    input: '$activeSchedules',
                    as: 'sc',
                    cond: { $eq: ['$$sc.status', SCHEDULE_STATUS.SOLD_OUT] },
                  },
                },
              },
              { $size: '$activeSchedules' },
            ],
          },
        },
      },

      // ── Stage 6: Vendor lookup (needed for package card vendor.name) ──────
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorData',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      {
        $addFields: {
          vendor: { $arrayElemAt: ['$vendorData', 0] },
        },
      },

      // ── Stage 7: Facet — count + sort (newest) + paginate + project ───────
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                title: 1,
                description: 1,
                location: 1,
                state: 1,
                difficultyLevel: 1,
                days: 1,
                nights: 1,
                usp: 1,
                images: { $slice: ['$images', 1] },
                category: { _id: 1, name: 1, slug: 1, icon: 1 },
                vendor: { _id: 1, name: 1 },
                startingFromPrice: 1,
                earliestDate: 1,
                earliestEndDate: 1,
                earliestScheduleStatus: 1,
                scheduleCount: 1,
                isSoldOut: 1,
                averageRating: 1,
                totalReviews: 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);

    const total = result.metadata[0]?.total ?? 0;
    const packages = result.data ?? [];

    return { packages, total };
  }

async softDelete(id: Types.ObjectId, vendorId: string): Promise<IBasePackageEntity | null> {
  return await this.model.findOneAndUpdate(
    { 
      _id: id, 
      vendorId: toObjectId(vendorId),  
      isDeleted: false 
    },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  ).exec();
}
}
