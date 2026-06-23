import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import mongoose, { FilterQuery } from 'mongoose';
import {
  IPayoutRepository,
  PayoutFilter,
  PlatformRevenueTrendResult,
  TopPerfomingPackagesResult,
  VendorPayoutsListResult,
  VendorRevenueStats,
} from '../interfaces/repository_interfaces/IPayoutRepository';
import {
  FindAllPayoutsResponseDto,
  PayoutStatsResponseDto,
} from '../interfaces/service_interfaces/IPayoutService';
import { PayoutModel } from '../models/payout.model';
import { IPayout } from '../types/entities/payout.entity';
import { PAYOUT_STATUS } from '../shared/constants/constants';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { Granularity, GRANULARITY_FORMAT } from '../shared/utils/date.helper';

@injectable()
export class PayoutRepository extends BaseRepository<IPayout> implements IPayoutRepository {
  constructor() {
    super(PayoutModel);
  }

  async updateStatus(
    payoutId: string,
    status: IPayout['status'],
    extras?: Partial<IPayout>,
  ): Promise<void> {
    await this.findByIdAndUpdate(payoutId, { status, ...extras });
  }

  async payoutStats(): Promise<PayoutStatsResponseDto> {
    const pipeline: mongoose.PipelineStage[] = [
      {
        $facet: {
          totalPayouts: [{ $group: { _id: null, value: { $sum: 1 } } }],
          completedPayouts: [
            { $match: { status: PAYOUT_STATUS.COMPLETED } },
            { $group: { _id: null, value: { $sum: 1 } } },
          ],
          failedPayouts: [
            { $match: { status: PAYOUT_STATUS.FAILED } },
            { $group: { _id: null, value: { $sum: 1 } } },
          ],
          processingPayouts: [
            { $match: { status: PAYOUT_STATUS.PROCESSING } },
            { $group: { _id: null, value: { $sum: 1 } } },
          ],
          totalRevenue: [{ $group: { _id: null, value: { $sum: '$grossAmount' } } }],
          totalCommision: [{ $group: { _id: null, value: { $sum: '$commissionAmount' } } }],
          totalNetAmount: [{ $group: { _id: null, value: { $sum: '$netAmount' } } }],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);

    return {
      totalPayouts: result?.totalPayouts?.[0]?.value || 0,
      totalReleased: result?.completedPayouts?.[0]?.value || 0,
      totalFailed: result?.failedPayouts?.[0]?.value || 0,
      totalRevanue: result?.totalRevenue?.[0]?.value || 0,
      commissionEarned: result?.totalCommision?.[0]?.value || 0,
      netAmount: result?.totalNetAmount?.[0]?.value || 0,
    };
  }

  async findAllPayouts(
    page: number,
    limit: number,
    search?: string,
    filter?: PayoutFilter,
  ): Promise<{ payouts: FindAllPayoutsResponseDto[]; total: number }> {
    const matchStage: FilterQuery<IPayout> = {};
    if (filter) {
      matchStage.status = filter;
    }

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
      {
        $lookup: {
          from: 'schedulepackages',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'scheduleData',
        },
      },
      { $addFields: { schedule: { $arrayElemAt: ['$scheduleData', 0] } } },
      {
        $lookup: {
          from: 'packages',
          localField: 'schedule.packageId',
          foreignField: '_id',
          as: 'packageData',
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
    ];

    if (search?.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { 'vendor.name': { $regex: search.trim(), $options: 'i' } },
            { 'package.title': { $regex: search.trim(), $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              id: '$_id',
              scheduleId: '$schedule._id',
              vendorname: '$vendor.name',
              scheduleStartDate: '$schedule.startDate',
              scheduleEndDate: '$schedule.endDate',
              packageTittle: '$package.title',
              grossAmount: 1,
              commissionAmount: 1,
              netAmount: 1,
              status: 1,
              scheduledAt: 1,
            },
          },
        ],
      },
    });

    const [result] = await this.model.aggregate(pipeline);

    return {
      payouts: result?.data || [],
      total: result?.metadata[0]?.total || 0,
    };
  }

  async findAllPayoutsByVendor(
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
    filter?: PayoutFilter,
  ): Promise<{ payouts: VendorPayoutsListResult[]; total: number }> {
    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          vendorId: toObjectId(vendorId),
          ...(filter ? { status: filter } : {}),
        },
      },
      {
        $lookup: {
          from: 'schedulepackages',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'schedule',
          pipeline: [{ $project: { startDate: 1, endDate: 1, packageId: 1 } }],
        },
      },
      { $addFields: { schedule: { $arrayElemAt: ['$schedule', 0] } } },
      {
        $lookup: {
          from: 'packages',
          localField: 'schedule.packageId',
          foreignField: '_id',
          as: 'packageData',
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
    ];

    if (search?.trim()) {
      pipeline.push({
        $match: {
          'package.title': { $regex: search.trim(), $options: 'i' },
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              payoutId: '$_id',
              scheduleId: '$scheduleId',
              scheduleStartDate: '$schedule.startDate',
              scheduleEndDate: '$schedule.endDate',
              packageTittle: '$package.title',
              grossAmount: 1,
              commissionAmount: 1,
              netAmount: 1,
              status: 1,
              scheduledAt: 1,
            },
          },
        ],
      },
    });

    const [result] = await this.model.aggregate(pipeline);

    return {
      payouts: result?.data || [],
      total: result?.metadata[0]?.total || 0,
    };
  }

  async revenueStatsByVendor(vendorId: string): Promise<VendorRevenueStats> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          vendorId: toObjectId(vendorId),
        },
      },
      {
        $facet: {
          total: [{ $group: { _id: null, value: { $sum: '$netAmount' } } }],
          currentMonth: [
            {
              $match: {
                createdAt: { $gte: currentMonthStart },
              },
            },
            { $group: { _id: null, value: { $sum: '$netAmount' } } },
          ],
          previousMonth: [
            {
              $match: {
                createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
              },
            },
            { $group: { _id: null, value: { $sum: '$netAmount' } } },
          ],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);

    const totalRevanue = result?.total?.[0]?.value || 0;
    const currentMonthRevanue = result?.currentMonth?.[0]?.value || 0;
    const previousMonthRevanue = result?.previousMonth?.[0]?.value || 0;

    return {
      totalRevanue,
      currentMonthRevanue,
      previousMonthRevanue,
      hasGrowth: currentMonthRevanue > previousMonthRevanue,
    };
  }

  async getTotalEarnings(): Promise<{
    totalVendorEarnings: number;
    totalCommission: number;
    totalBookings: number;
  }> {
    const [result] = await this.model.aggregate([
      {
        $group: {
          _id: null,
          totalVendorEarnings: { $sum: '$netAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalBookings: { $sum: { $size: '$bookingIds' } },
        },
      },
    ]);

    return {
      totalVendorEarnings: result?.totalVendorEarnings || 0,
      totalCommission: result?.totalCommission || 0,
      totalBookings: result?.totalBookings || 0,
    };
  }

  async findTop5Packages(): Promise<TopPerfomingPackagesResult[]> {
    const result = await this.model.aggregate([
      {
        $lookup: {
          from: 'schedulepackages',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'schedule',
          pipeline: [{ $project: { packageId: 1 } }],
        },
      },
      { $addFields: { schedule: { $arrayElemAt: ['$schedule', 0] } } },
      {
        $group: {
          _id: '$schedule.packageId',
          revanueGenerate: { $sum: '$commissionAmount' },
          totalScheduleCompleted: { $sum: 1 },
        },
      },
      { $sort: { revanueGenerate: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'package',
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      { $addFields: { package: { $arrayElemAt: ['$package', 0] } } },
      {
        $project: {
          _id: 0,
          id: '$package._id',
          packageTitle: { $ifNull: ['$package.title', 'Unknown Package'] },
          revanueGenerate: 1,
          totalScheduleCompleted: 1,
        },
      },
    ]);

    return result;
  }

  async platformRevenueTrend(
    startDate: Date,
    endDate: Date,
    granularity: Granularity,
  ): Promise<PlatformRevenueTrendResult[]> {
    return this.model.aggregate([
      {
        $match: {
          status: PAYOUT_STATUS.COMPLETED,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: GRANULARITY_FORMAT[granularity],
              date: '$createdAt',
            },
          },
          totalRevenue: { $sum: '$grossAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalVendorEarnings: { $sum: '$netAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
