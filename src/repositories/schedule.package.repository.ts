import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ISchedule, ISchedulePopulated } from '../types/entities/schedule.entity';
import { ISchedulePackageRepository, ScheduledStatsResult } from '../interfaces/repository_interfaces/ISchedulePackage';
import SchedulePackageModel from '../models/schedule.model';
import mongoose, { Types } from 'mongoose';
import { PAYOUT_STATUS, SCHEDULE_STATUS, ScheduleStatus } from '../shared/constants/constants';
import { FilterType } from '../types/db';
import { FilterQuery, UpdateResult } from 'mongoose';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../shared/constants/booking';
import {
  PackageScheduleResult,
  SchedulesResponseResult,
} from '../interfaces/repository_interfaces/ISchedulePackage';
import { PayoutScheduleListResponseDto } from 'interfaces/service_interfaces/IPayoutService';

@injectable()
export class SchedulePackageRepository
  extends BaseRepository<ISchedule>
  implements ISchedulePackageRepository {
  constructor() {
    super(SchedulePackageModel);
  }

  async findOverlapping(
    packageId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<ISchedule | null> {
    const query: mongoose.FilterQuery<ISchedule> = {
      packageId: new mongoose.Types.ObjectId(packageId),
      status: { $in: [SCHEDULE_STATUS.UPCOMING, SCHEDULE_STATUS.ONGOING] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    };

    if (excludeId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    return this.findOne(query) as Promise<ISchedule | null>;
  }

  async findSchedulesWithPackage(
    filters: FilterType,
    vendorId: string,
  ): Promise<{ schedules: ISchedulePopulated[]; total: number }> {
    const query: FilterQuery<ISchedule> = {
      vendorId: toObjectId(vendorId),
    };

    if (filters.selectedFilter?.trim()) {
      query.status = filters.selectedFilter;
    }

    if (filters.startDate || filters.endDate) {
      query.startDate = {
        ...(filters.startDate ? { $gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { $lte: new Date(filters.endDate) } : {}),
      };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [schedules, total] = await Promise.all([
      this.model
        .find(query)
        .populate<{
          packageId: ISchedulePopulated['packageId'];
        }>('packageId', 'title days difficultyLevel')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(filters.limit)
        .lean<ISchedulePopulated[]>(),

      this.model.countDocuments(query),
    ]);

    return { schedules, total };
  }

  async getStatusCounts(vendorId: string): Promise<Record<string, number>> {
    const result = await this.model.aggregate([
      { $match: { vendorId: toObjectId(vendorId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return result.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async findPublicSchedulesByPackage(packageId: string): Promise<ISchedule[]> {
    return this.model
      .find({
        packageId: new mongoose.Types.ObjectId(packageId),
        status: { $in: [SCHEDULE_STATUS.UPCOMING, SCHEDULE_STATUS.SOLD_OUT] },
      })
      .sort({ startDate: 1 })
      .lean();
  }

  async countCompletedByVendor(vendorId: string): Promise<number> {
    return this.countDocuments({
      vendorId: toObjectId(vendorId),
      status: SCHEDULE_STATUS.COMPLETED,
    });
  }

  async confirmSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<ISchedule | null> {
    return this.model.findOneAndUpdate(
      {
        _id: new Types.ObjectId(scheduleId),
      },
      { $inc: { seatsBooked: seatsCount } },
      { new: true, session },
    );
  }

  async cancelSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult> {
    return this.model.updateOne(
      {
        _id: new Types.ObjectId(scheduleId),
      },
      { $inc: { seatsBooked: -seatsCount } },
      { session },
    );
  }

  async updateScheduleStatus(
    scheduleId: string,
    status: ScheduleStatus,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult> {
    return this.model.updateOne(
      {
        _id: new Types.ObjectId(scheduleId),
      },
      { $set: { status } },
      { session },
    );
  }

  async getPackageSchedules(
    packageId: string,
    page: number,
    limit: number,
    filter?: ScheduleStatus,
  ): Promise<{ schedules: PackageScheduleResult[]; total: number }> {
    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          packageId: toObjectId(packageId),
          ...(filter
            ? { status: filter }
            : {
              status: {
                $in: [
                  SCHEDULE_STATUS.UPCOMING,
                  SCHEDULE_STATUS.SOLD_OUT,
                  SCHEDULE_STATUS.COMPLETED,
                ],
              },
            }),
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'scheduleId',
          pipeline: [
            {
              $match: {
                bookingStatus: { $ne: BOOKING_STATUS.CANCELLED_BY_USER },
              },
            },
          ],
          as: 'bookings',
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { startDate: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                startDate: 1,
                endDate: 1,
                totalSeats: 1,
                status: 1,
                soldSeats: '$seatsBooked',
                bookingsCount: { $size: '$bookings' },
                totalRevanue: { $sum: '$bookings.finalAmount' },
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.model.aggregate<{
      metadata: [{ total: number }?];
      data: PackageScheduleResult[];
    }>(pipeline);

    const total = result?.metadata?.[0]?.total ?? 0;
    const schedules = result?.data ?? [];

    return { schedules, total };
  }

  async getSchedulesAll(
    page: number,
    limit: number,
    filter?: ScheduleStatus,
    search?: string,
  ): Promise<{ schedules: SchedulesResponseResult[]; total: number }> {
    const matchStage: mongoose.FilterQuery<ISchedule> = {};

    if (filter) {
      matchStage.status = filter;
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'packages',
          localField: 'packageId',
          foreignField: '_id',
          as: 'packageData',
          pipeline: [{ $project: { title: 1, location: 1, days: 1 } }],
        },
      },
      { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
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
    ];

    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      pipeline.push({
        $match: {
          $or: [
            { 'package.title': regex },
            { 'package.location': regex },
            { 'vendor.name': regex },
          ],
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'scheduleId',
          pipeline: [
            {
              $match: {
                bookingStatus: { $ne: BOOKING_STATUS.CANCELLED_BY_USER },
              },
            },
            { $project: { finalAmount: 1 } },
          ],
          as: 'bookings',
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { startDate: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                packageTittle: '$package.title',
                packageLocation: '$package.location',
                totalDays: { $toInt: '$package.days' },
                vendorName: '$vendor.name',
                startDate: 1,
                endDate: 1,
                totalSeats: 1,
                totalBooked: '$seatsBooked',
                status: 1,
                totalRevanue: { $sum: '$bookings.finalAmount' },
              },
            },
          ],
        },
      },
    );

    const [result] = await this.model.aggregate<{
      metadata: [{ total: number }?];
      data: SchedulesResponseResult[];
    }>(pipeline);

    const total = result.metadata?.[0]?.total ?? 0;
    const schedules = result.data ?? [];

    return { schedules, total };
  }

  async getSchedulesForPayout(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ schedules: PayoutScheduleListResponseDto[]; total: number }> {

    const matchStage: mongoose.FilterQuery<ISchedule> = {
      status: SCHEDULE_STATUS.COMPLETED,
      payoutStatus: PAYOUT_STATUS.PENDING,
    };

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'packages',
          localField: 'packageId',
          foreignField: '_id',
          as: 'packageData',
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      { $addFields: { package: { $arrayElemAt: ['$packageData', 0] } } },
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
    ];

    if (search?.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      pipeline.push({
        $match: {
          $or: [{ 'package.title': regex }, { 'vendor.name': regex }],
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'scheduleId',
          pipeline: [
            {
              $match: {
                bookingStatus: { $nin: [BOOKING_STATUS.PENDING, BOOKING_STATUS.PAYMENT_FAILED] },
                paymentStatus: { $eq: PAYMENT_STATUS.PAID }
              },
            },
            {
              $group: {
                _id: null,
                grossAmount: { $sum: { $cond: [{ $in: ['$bookingStatus', [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED]] }, '$finalAmount', 0] } },
                commissionAmount: { $sum: { $cond: [{ $in: ['$bookingStatus', [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED]] }, '$platformCommission', 0] } },
                netAmount: { $sum: { $cond: [{ $in: ['$bookingStatus', [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED]] }, '$vendorEarning', 0] } },
                totalRefundedAmount: {
                  $sum: {
                    $cond: [
                      { $eq: ['$bookingStatus', BOOKING_STATUS.CANCELLED_BY_USER] },
                      { $subtract: ['$finalAmount', { $ifNull: ['$cancelationRefundAmount', 0] }] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: 'bookings',
        },
      },
      {
        $lookup: {
          from: 'vendorinfos',
          localField: 'vendorId',
          foreignField: 'userId',
          as: 'vendorInfoData',
          pipeline: [{ $project: { transactionConnect: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'payouts',
          localField: '_id',
          foreignField: 'scheduleId',
          as: 'failedPayouts',
          pipeline: [{ $match: { status: PAYOUT_STATUS.FAILED } }, { $project: { _id: 1 } }],
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { endDate: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                id: '$_id',
                vendorId: 1,
                vendorname: '$vendor.name',
                scheduleId: '$_id',
                scheduleStartDate: '$startDate',
                scheduleEndDate: '$endDate',
                packageTittle: '$package.title',
                grossAmount: { $ifNull: [{ $arrayElemAt: ['$bookings.grossAmount', 0] }, 0] },
                commissionAmount: { $ifNull: [{ $arrayElemAt: ['$bookings.commissionAmount', 0] }, 0] },
                netAmount: { $ifNull: [{ $arrayElemAt: ['$bookings.netAmount', 0] }, 0] },
                totalRefundedAmount: { $ifNull: [{ $arrayElemAt: ['$bookings.totalRefundedAmount', 0] }, 0] },
                status: 1,
                scheduledAt: '$createdAt',
                payoutsEnabled: {
                  $let: {
                    vars: { info: { $arrayElemAt: ['$vendorInfoData', 0] } },
                    in: { $ifNull: ['$$info.transactionConnect.payoutsEnabled', false] },
                  },
                },
                transactionConnectId: {
                  $let: {
                    vars: { info: { $arrayElemAt: ['$vendorInfoData', 0] } },
                    in: { $ifNull: ['$$info.transactionConnect.accountId', ''] },
                  },
                },
                readyToPayout: {
                  $lte: [
                    { $add: ['$endDate', 2 * 24 * 60 * 60 * 1000] },
                    new Date()
                  ]
                },
                alreadyFailed: { $gt: [{ $size: '$failedPayouts' }, 0] },
              },
            },
          ],
        },
      },
    );

    const [result] = await this.model.aggregate<{
      metadata: [{ total: number }?];
      data: PayoutScheduleListResponseDto[];
    }>(pipeline);

    const total = result?.metadata?.[0]?.total ?? 0;
    const schedules = result?.data ?? [];

    return { schedules, total };
  }

  async markSchedulePayoutAsCompleted(scheduleId: string, payoutId: Types.ObjectId): Promise<ISchedule | null> {
    return await this.findOneAndUpdate(
      { _id: toObjectId(scheduleId) },
      { payoutStatus: 'paid', payoutId },
      { new: true }
    );
  };

  async scheduledStatsByVendor(vendorId:string):Promise<ScheduledStatsResult> {

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          vendorId: toObjectId(vendorId)
        }
      },
      {
        $facet: {
          total: [
            { $match: { status: SCHEDULE_STATUS.COMPLETED } },
            { $group: { _id: null, value: { $sum: 1 } } }
          ],
          currentMonth: [
            {
              $match: {
                createdAt: { $gte: currentMonthStart },
                status: {$in: [SCHEDULE_STATUS.COMPLETED, SCHEDULE_STATUS.ONGOING, SCHEDULE_STATUS.SOLD_OUT,SCHEDULE_STATUS.UPCOMING] }
              }
            },
            { $group: { _id: null, value: { $sum: 1 } } }
          ],
          previousMonth: [
            {
              $match: {
                createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
                status: {$in: [SCHEDULE_STATUS.COMPLETED, SCHEDULE_STATUS.ONGOING, SCHEDULE_STATUS.SOLD_OUT,SCHEDULE_STATUS.UPCOMING] }

              }
            },
            { $group: { _id: null, value: { $sum: 1 } } }
          ],
          activeSchedule: [
            {
              $match: {
                status: {$in:[SCHEDULE_STATUS.ONGOING,SCHEDULE_STATUS.UPCOMING]}
              }
            },
            { $count: "count" }
          ],
          ongoingSchedule: [
            {
              $match: {
                status: {$in:[SCHEDULE_STATUS.ONGOING]}
              }
            },
            { $count: "count" }
          ]
        }
      }
    ];

    const [result] = await this.model.aggregate(pipeline);

    const totalSchedule = result?.total?.[0]?.value || 0;
    const currentMonthRevanue = result?.currentMonth?.[0]?.value || 0;
    const previousMonthRevanue = result?.previousMonth?.[0]?.value || 0;
    const activeSchedule = result?.activeSchedule?.[0]?.count || 0;
    const ongoingSchedule = result?.ongoingSchedule?.[0]?.count || 0;

    return {
      totalSchedule,
      currentMonthSchedule:currentMonthRevanue,
      hasGrowth: currentMonthRevanue > previousMonthRevanue,
      activeSchedule,
      ongoingSchedule,
      
    };
  }
}
