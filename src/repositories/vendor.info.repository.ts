import { VendorInformationModel } from '../models/vendor.info.model';
import mongoose, { FilterQuery, PipelineStage } from 'mongoose';
import { IVendorInfoRepository } from 'interfaces/repository_interfaces/IVendorInfoRepository';
import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import {
  IVendorInfo,
  IVendorInfoWithUser,
  IVendorInfoPopulated,
} from '../types/entities/vendor.info.entity';
import { CustomQueryOptions } from '../types/common/IQueryOptions';
import { IUser } from '../types/entities/user.entity';
import { PaginatedCommissionOverviewByVendors } from '../interfaces/service_interfaces/admin/IAdminFinanceService';
import { BOOKING_STATUS } from '../shared/constants/booking';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../shared/constants/constants';
import { toObjectId } from '../shared/utils/database/objectId.helper';

@injectable()
export class VendorInfoRepository
  extends BaseRepository<IVendorInfo>
  implements IVendorInfoRepository
{
  constructor() {
    super(VendorInformationModel);
  }

  async findVendorWithUserId(userId: string): Promise<IVendorInfoPopulated | null> {
    const vendor = await VendorInformationModel.findOne({ userId })
      .populate('userId')
      .lean<IVendorInfoPopulated>()
      .exec();
    return vendor;
  }

  async updateStripeAccountId(vendorId: string, accountId: string): Promise<void> {
    await this.model.updateOne(
      { userId: toObjectId(vendorId) },
      { $set: { 'transactionConnect.accountId': accountId } }
    ).exec();
  }

  async updateStripeAccountStatus(vendorId: string, onboardingComplete:boolean, chargesEnabled: boolean, payoutsEnabled: boolean): Promise<void> {
  await this.model.updateOne(
    { userId: toObjectId(vendorId) },
    { 
      'transactionConnect.onboardingComplete': onboardingComplete,
      'transactionConnect.chargesEnabled': chargesEnabled,
      'transactionConnect.payoutsEnabled': payoutsEnabled 
    }
  ).exec();
}

async findVendors(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IUser>,
    options: CustomQueryOptions = { skip: 0, limit: 10, sort: { createdAt: -1 } },
  ): Promise<IVendorInfoWithUser[]> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      { $match: { isProfileVerified: true } },

      { $match: vendorSearchQuery },
      { $match: vendorFilter },

      { $sort: options.sort },
      { $skip: options.skip },
      { $limit: options.limit },
    ];
    const result = await VendorInformationModel.aggregate<IVendorInfoWithUser>(pipeline);
    return result;
  }

  async countVendorDocuments(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IVendorInfo>,
    matchQuery?: FilterQuery<IVendorInfo>,
  ): Promise<number> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (matchQuery) pipeline.push({ $match: matchQuery });

    pipeline.push({ $match: vendorSearchQuery }, { $match: vendorFilter }, { $count: 'totalDocs' });

    const result = await VendorInformationModel.aggregate(pipeline);

    return result[0]?.totalDocs || 0;
  }

  async findVendorsVerificationDetails(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IVendorInfo>,
    options: CustomQueryOptions = { skip: 0, limit: 10, sort: { createdAt: -1 } },
  ): Promise<IVendorInfoWithUser[]> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.role': 'vendor' } },

      { $match: vendorSearchQuery },
      { $match: vendorFilter },

      { $sort: options.sort },
      { $skip: options.skip },
      { $limit: options.limit },
    ];

    const result = await VendorInformationModel.aggregate<IVendorInfoWithUser>(pipeline);

    return result;
  };

  async getCommissionOverviewByVendors(
      page: number,
      limit: number,
      search?: string,
    ): Promise<PaginatedCommissionOverviewByVendors> {
      const skip = (page - 1) * limit;
  
    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          isProfileVerified:true,
        },
      },
      {
        $lookup: {
          from: 'bookings',
          let: { vendorId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$vendorId', '$$vendorId'] },
                bookingStatus: BOOKING_STATUS.COMPLETED,
              },
            },
          ],
          as: 'completedBookings',
        },
      },
      {
        $lookup: {
          from: 'packages',
          let: { vendorId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$vendorId', '$$vendorId'] },
                status: PACKAGE_STATUS.PUBLISHED,
                isActive: true,
              },
            },
            { $count: 'count' },
          ],
          as: 'vendorPackages',
        },
      },
      {
        $lookup: {
          from: 'schedulepackages',
          let: { vendorId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$vendorId', '$$vendorId'] },
                status: SCHEDULE_STATUS.COMPLETED,
              },
            },
            { $count: 'count' },
          ],
          as: 'vendorSchedules',
        },
      },
            {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'vendorDetails',
        },
      },
      {
        $unwind: { path: '$vendorDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          vendorName: { $ifNull: ['$vendorDetails.name', 'Unknown Vendor'] },
          totalBookings: { $size: '$completedBookings' },
          totalGrossAmount: { $sum: '$completedBookings.finalAmount' },
          totalPlatformCommission: { $sum: '$completedBookings.platformCommission' },
          totalVendorEarnings: { $sum: '$completedBookings.vendorEarning' },
          totalPackages: {
            $ifNull: [{ $arrayElemAt: ['$vendorPackages.count', 0] }, 0],
          },
          totalCompletedSchedules: {
            $ifNull: [{ $arrayElemAt: ['$vendorSchedules.count', 0] }, 0],
          },
        },
      },
    ];
  
      if (search) {
        pipeline.push({
          $match: {
            vendorName: { $regex: search, $options: 'i' },
          },
        });
      }

      pipeline.push({
        $sort: { totalGrossAmount: -1 },
      });
  
      pipeline.push({
        $project: {
          _id: 0,
          vendorName: 1,
          totalPackages: 1,
          totalCompletedSchedules: 1,
          totalBookings: 1,
          totalGrossAmount: 1,
          totalPlatformCommission: 1,
          totalVendorEarnings: 1,
        },
      });
  
      pipeline.push({
        $facet: {
          metadata: [{ $count: 'totalDocs' }],
          data: [{ $skip: skip }, { $limit: limit }],
          totals: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: '$totalBookings' },
                totalSchedules: { $sum: '$totalCompletedSchedules' },
              },
            },
          ],
        },
      });
  
    const [result] = await this.model.aggregate(pipeline);
  
    const totalDocs = result?.metadata?.[0]?.totalDocs || 0;
    const totals = result?.totals?.[0] || { totalBookings: 0, totalSchedules: 0 };
  
      return {
        data: result?.data || [],
        page,
        limit,
        totalPages: Math.ceil(totalDocs / limit),
        totalDocs,
        totalBookings: totals.totalBookings || 0,
        totalScedules: totals.totalSchedules || 0,
      };
    }


}
