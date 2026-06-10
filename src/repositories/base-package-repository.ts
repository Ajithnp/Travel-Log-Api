import { injectable } from 'tsyringe';
import {
  IBasePackageRepository,
  RawPublicPackageDocument,
  AdminPackageOversightResult,
  AdminPackageDetailsResult,
  PackageOfferInfo,
  IPackageListItem,
} from '../interfaces/repository_interfaces/IBasePackageRepository';
import { BaseRepository } from './base.repository';
import { IBasePackageEntity } from '../types/entities/base-package.entity';
import { PackageModel } from '../models/package.model';
import { FilterType, PublicPackageFilters } from '../types/db';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { MongoNumberRange } from '../types/db';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../shared/constants/constants';
import { BOOKING_STATUS } from '../shared/constants/booking';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { PaginatedCommissionOverviewByPackages } from '../interfaces/service_interfaces/admin/IAdminFinanceService';

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
        return { averageRating: -1, totalReviews: -1 };
      case 'offered':
        return { hasOffer: -1, offerPercentage: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  async findPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<{ requests: IPackageListItem[]; total: number }> {
    const matchStage: mongoose.FilterQuery<IBasePackageEntity> = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
    };

    if (filters.search?.trim()) {
      const regex = { $regex: filters.search.trim(), $options: 'i' };
      matchStage.$or = [{ location: regex }, { state: regex }];
    }

    if (filters.selectedFilter?.trim()) {
      matchStage.status = filters.selectedFilter;
    }

    const skip = (filters.page - 1) * filters.limit;
    const now = new Date();

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },

      {
        $lookup: {
          from: 'offers',
          let: { pkgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$packageId', '$$pkgId'] },
                    { $eq: ['$isActive', true] },
                    { $gt: ['$validUntil', now] },
                  ],
                },
              },
            },
            { $sort: { discountValue: -1 } },
            { $limit: 1 },
            { $project: { discountValue: 1 } },
          ],
          as: 'activeOffer',
        },
      },

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
            { $count: 'count' },
          ],
          as: 'scheduleMeta',
        },
      },

      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData',
          pipeline: [{ $project: { name: 1 } }],
        },
      },

      {
        $lookup: {
          from: 'cancellationpolicies',
          localField: 'cancellationPolicy',
          foreignField: '_id',
          as: 'policyData',
          pipeline: [{ $project: { label: 1, key: 1 } }],
        },
      },

      {
        $addFields: {
          hasOffer: { $gt: [{ $size: '$activeOffer' }, 0] },
          offerPercentage: { $ifNull: [{ $arrayElemAt: ['$activeOffer.discountValue', 0] }, 0] },
          scheduleCount: { $ifNull: [{ $arrayElemAt: ['$scheduleMeta.count', 0] }, 0] },
          categoryId: { $ifNull: [{ $arrayElemAt: ['$categoryData', 0] }, null] },
          cancellationPolicy: { $ifNull: [{ $arrayElemAt: ['$policyData', 0] }, null] },
        },
      },

      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: 1 } },
            { $skip: skip },
            { $limit: filters.limit },
            {
              $project: {
                title: 1,
                location: 1,
                basePrice: 1,
                state: 1,
                status: 1,
                days: 1,
                nights: 1,
                difficultyLevel: 1,
                images: 1,
                createdAt: 1,
                categoryId: 1,
                cancellationPolicy: 1,
                hasOffer: 1,
                offerPercentage: 1,
                scheduleCount: 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);

    return {
      requests: result.data ?? [],
      total: result.metadata[0]?.total ?? 0,
    };
  }

  async findPublicPackages(
    filters: PublicPackageFilters,
  ): Promise<{ packages: RawPublicPackageDocument[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const pipeline: mongoose.PipelineStage[] = [];

    // ── Stage 1: Base match
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

    // ── Stage 2: Category lookup + filter
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

    // ── Stage 3: Join schedules
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

    // ── Stage 4: Remove packages with no active schedules
    pipeline.push({
      $match: { 'activeSchedules.0': { $exists: true } },
    });

    // ── Stage 5: Compute derived fields
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

    // ── Stage 6: Price range filter
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

    // ── Stage 7: Rating filter

    if (filters.minRating !== undefined) {
      pipeline.push({
        $match: { averageRating: { $gte: Number(filters.minRating) } },
      });
    }

    // ── Stage 8: Vendor lookup
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

    // ── Stage 9: Offer lookup — check if package has an active, non-expired offer
    pipeline.push({
      $lookup: {
        from: 'offers',
        let: { pkgId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$packageId', '$$pkgId'] },
                  { $eq: ['$isActive', true] },
                  { $gte: ['$validUntil', new Date()] },
                ],
              },
            },
          },
          { $sort: { discountValue: -1 } },
          { $limit: 1 },
          { $project: { discountValue: 1 } },
        ],
        as: 'activeOffer',
      },
    });

    pipeline.push({
      $addFields: {
        hasOffer: { $gt: [{ $size: '$activeOffer' }, 0] },
        offerPercentage: {
          $ifNull: [{ $arrayElemAt: ['$activeOffer.discountValue', 0] }, 0],
        },
      },
    });

    // ── Stage 10: Facet — count + sort + paginate + project
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
              hasOffer: 1,
              offerPercentage: 1,
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

  async findVendorPublicPackages(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{ packages: RawPublicPackageDocument[]; total: number }> {
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          vendorId: vendorObjectId,
          status: PACKAGE_STATUS.PUBLISHED,
          isActive: true,
        },
      },

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

      //  Join active schedules
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

      //  Drop packages with no active schedules
      { $match: { 'activeSchedules.0': { $exists: true } } },

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
    return await this.model
      .findOneAndUpdate(
        {
          _id: id,
          vendorId: toObjectId(vendorId),
        },
        { isDeleted: true, status: PACKAGE_STATUS.DELETED },
        { new: true },
      )
      .exec();
  }

  async restore(id: string, vendorId: string): Promise<IBasePackageEntity | null> {
    return await this.model
      .findOneAndUpdate(
        { _id: toObjectId(id), vendorId: toObjectId(vendorId), isDeleted: true },
        { isDeleted: false, deletedAt: null },
        { new: true },
      )
      .exec();
  }

  async getPackagesOversight(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ packages: AdminPackageOversightResult[]; total: number }> {
    const matchStage: mongoose.FilterQuery<IBasePackageEntity> = {
      status: PACKAGE_STATUS.PUBLISHED,
      isDeleted: false,
    };

    const searchMatchStage: mongoose.PipelineStage[] = search?.trim()
      ? [
          {
            $match: {
              $or: [
                { title: { $regex: search.trim(), $options: 'i' } },
                { location: { $regex: search.trim(), $options: 'i' } },
                { state: { $regex: search.trim(), $options: 'i' } },
                { 'vendor.name': { $regex: search.trim(), $options: 'i' } },
              ],
            },
          },
        ]
      : [];

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },

      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorData',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $addFields: { vendor: { $arrayElemAt: ['$vendorData', 0] } } },

      ...searchMatchStage,

      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $addFields: { category: { $arrayElemAt: ['$categoryData', 0] } } },

      {
        $lookup: {
          from: 'schedulepackages',
          localField: '_id',
          foreignField: 'packageId',
          as: 'schedules',
          pipeline: [{ $project: { _id: 1 } }],
        },
      },

      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                packageName: '$title',
                location: 1,
                state: 1,
                status: 1,
                totalDays: { $toInt: '$days' },
                difficultylevel: '$difficultyLevel',
                vendorName: '$vendor.name',
                categoryName: '$category.name',
                scheduleCount: { $size: '$schedules' },
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.model.aggregate<{
      metadata: [{ total: number }?];
      data: AdminPackageOversightResult[];
    }>(pipeline);

    const total = result.metadata[0]?.total ?? 0;
    const packages = result.data ?? [];

    return { packages, total };
  }

  async getPackageDetails(packageId: string): Promise<AdminPackageDetailsResult | null> {
    const pipeline: mongoose.PipelineStage[] = [
      { $match: { _id: toObjectId(packageId) } },

      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorData',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $addFields: { vendor: { $arrayElemAt: ['$vendorData', 0] } } },

      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData',
          pipeline: [{ $project: { name: 1, isActive: 1 } }],
        },
      },
      { $addFields: { category: { $arrayElemAt: ['$categoryData', 0] } } },

      {
        $lookup: {
          from: 'schedulepackages',
          localField: '_id',
          foreignField: 'packageId',
          as: 'schedules',
          pipeline: [
            { $match: { status: { $in: [SCHEDULE_STATUS.UPCOMING, SCHEDULE_STATUS.SOLD_OUT] } } },
            { $project: { pricing: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: 'cancellationpolicies',
          localField: 'cancellationPolicy',
          foreignField: '_id',
          as: 'policyData',
          pipeline: [{ $project: { label: 1 } }],
        },
      },
      { $addFields: { policy: { $arrayElemAt: ['$policyData', 0] } } },

      {
        $project: {
          _id: 1,
          packageName: '$title',
          location: 1,
          state: 1,
          days: { $toInt: '$days' },
          nights: { $toInt: '$nights' },
          difficultylevel: '$difficultyLevel',
          vendorName: '$vendor.name',
          categoryName: '$category.name',
          categoryIsActive: { $eq: ['$category.isActive', true] },
          totalScedule: { $size: '$schedules' },
          cancellationPolicyLabel: '$policy.label',
          status: 1,
          pricing: {
            $map: {
              input: { $ifNull: [{ $arrayElemAt: ['$schedules.pricing', 0] }, []] },
              as: 'p',
              in: {
                priceTier: '$$p.type',
                peopleCount: '$$p.peopleCount',
                price: '$$p.price',
              },
            },
          },
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);
    return result || null;
  }

  async findPackagesByVendorIdForOffer(vendorId: string): Promise<PackageOfferInfo[]> {
    const currentDate = new Date();

    const pipeline = [
      {
        $match: {
          vendorId: toObjectId(vendorId),
          status: PACKAGE_STATUS.PUBLISHED,
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'offers',
          localField: '_id',
          foreignField: 'packageId',
          pipeline: [
            {
              $match: {
                isActive: true,
                validUntil: { $gte: currentDate },
              },
            },
          ],
          as: 'activeOffers',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          hasOffer: { $gt: [{ $size: '$activeOffers' }, 0] },
          offerValue: {
            $cond: {
              if: { $gt: [{ $size: '$activeOffers' }, 0] },
              then: { $arrayElemAt: ['$activeOffers.discountValue', 0] },
              else: 0,
            },
          },
        },
      },
    ];

    return this.model.aggregate(pipeline);
  }

  async getCommissionOverviewByPackages(
    page: number,
    limit: number,
    search?: string,
    
  ): Promise<PaginatedCommissionOverviewByPackages> {

    const matchStage: mongoose.FilterQuery<IBasePackageEntity> = {
      status: PACKAGE_STATUS.PUBLISHED,
      isActive: true,
    };

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
    ];

    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      pipeline.push({
        $match: {
          $or: [{ title: regex }, { 'vendor.name': regex }],
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'schedulepackages',
          let: { pkgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$packageId', '$$pkgId'] },
                status: SCHEDULE_STATUS.COMPLETED,
              },
            },
          ],
          as: 'completedSchedules',
        },
      },
      {
        $lookup: {
          from: 'bookings',
          let: { pkgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$packageId', '$$pkgId'] },
                bookingStatus: BOOKING_STATUS.COMPLETED,
              },
            },
          ],
          as: 'completedBookings',
        },
      },
      {
        $project: {
          vendorName: '$vendor.name',
          packageName: '$title',
          totalScedule: { $size: '$completedSchedules' },
          totalBookings: { $size: '$completedBookings' },
          totalGrossAmount: { $sum: '$completedBookings.finalAmount' },
          totalPlatformCommission: { $sum: '$completedBookings.platformCommission' },
          totalVendorEarnings: { $sum: '$completedBookings.vendorEarning' },
        },
      }
    );

    pipeline.push({
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              totalPackages: { $sum: 1 },
              totalScedules: { $sum: '$totalScedule' },
              totalBookings: { $sum: '$totalBookings' },
              totalGrossAmount: { $sum: '$totalGrossAmount' },
              totalPlatformCommission: { $sum: '$totalPlatformCommission' },
              totalVendorEarnings: { $sum: '$totalVendorEarnings' },
            },
          },
        ],
        data: [{ $sort: {totalVendorEarnings: -1} }, { $skip: (page - 1) * limit }, { $limit: limit }],
      },
    });

    const [result] = await this.model.aggregate(pipeline);

    const metadata = result.metadata[0] || {
      totalPackages: 0,
      totalScedules: 0,
      totalBookings: 0,
      totalGrossAmount: 0,
      totalPlatformCommission: 0,
      totalVendorEarnings: 0,
    };

    return {
      data: result.data || [],
      page,
      limit,
      totalPages: Math.ceil(metadata.totalPackages / limit),
      totalDocs: metadata.totalPackages,
      totalBookings: metadata.totalBookings,
      totalScedules: metadata.totalScedules,
      totalPackages: metadata.totalPackages,
      totalVendorEarnings: metadata.totalVendorEarnings,
      totalPlatformCommission: metadata.totalPlatformCommission,
      totalGrossAmount: metadata.totalGrossAmount,
    };
  }
}
