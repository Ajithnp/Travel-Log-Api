import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { IOfferEntity } from '../types/entities/offer.entity';
import { OfferModel } from '../models/offer.model';
import {
  IOfferRepository,
  PaginatedOfferResult,
} from '../interfaces/repository_interfaces/IOfferRepository';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { VendorOfferFilters } from '../types/db';
import mongoose from 'mongoose';

@injectable()
export class OfferRepository extends BaseRepository<IOfferEntity> implements IOfferRepository {
  constructor() {
    super(OfferModel);
  }

  async findVendorOffers(
    vendorId: string,
    query: VendorOfferFilters,
  ): Promise<PaginatedOfferResult> {
    const skip = (query.page - 1) * query.limit;
    const limit = query.limit;

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          vendorId: toObjectId(vendorId),
        },
      },
    ];

    if (query.isActive !== undefined) {
      pipeline.push({
        $match: {
          isActive: query.isActive,
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: 'packages',
        localField: 'packageId',
        foreignField: '_id',
        as: 'package',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$package',
        preserveNullAndEmptyArrays: true,
      },
    });

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      pipeline.push({
        $match: {
          $or: [{ name: { $regex: searchRegex } }, { 'package.title': { $regex: searchRegex } }],
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        vendorId: { $toString: '$vendorId' },
        packageId: { $toString: '$packageId' },
        packageTittle: { $ifNull: ['$package.title', ''] },
        scheduleId: { $ifNull: [{ $toString: '$scheduleId' }, null] },
        name: 1,
        discountType: 1,
        discountValue: 1,
        maxDiscountCap: { $ifNull: ['$maxDiscountCap', null] },
        minBookingAmount: { $ifNull: ['$minBookingAmount', null] },
        usageLimit: { $ifNull: ['$usageLimit', null] },
        usedCount: 1,
        validFrom: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$validFrom' } },
        validUntil: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$validUntil' } },
        isActive: 1,
        createdAt: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$createdAt' } },
      },
    });

    pipeline.push({
      $sort: { createdAt: -1 },
    });

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const result = await this.model.aggregate(pipeline);

    const totalDocs = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    return {
      data,
      totalDocs,
    };
  }

  async hasActiveOfferByPackage(
    packageId: string,
  ): Promise<{ hasOffer: boolean; offerPercentage: number; offerId: string | null }> {
    const offer = await this.findOne({
      packageId: toObjectId(packageId),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    return {
      hasOffer: !!offer,
      offerPercentage: offer?.discountType === 'percentage' ? offer?.discountValue : 0,
      offerId: offer?._id?.toString() || null,
    };
  }
}
