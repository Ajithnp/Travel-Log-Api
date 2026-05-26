import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ISchedule, ISchedulePopulated } from '../types/entities/schedule.entity';
import { ISchedulePackageRepository } from '../interfaces/repository_interfaces/ISchedulePackage';
import SchedulePackageModel from '../models/schedule.model';
import mongoose, { Types } from 'mongoose';
import { SCHEDULE_STATUS, ScheduleStatus } from '../shared/constants/constants';
import { FilterType } from '../types/db';
import { FilterQuery, UpdateResult } from 'mongoose';
import { toObjectId } from '../shared/utils/database/objectId.helper';

@injectable()
export class SchedulePackageRepository
  extends BaseRepository<ISchedule>
  implements ISchedulePackageRepository
{
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
}
