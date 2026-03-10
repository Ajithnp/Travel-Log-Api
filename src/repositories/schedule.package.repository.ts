import { injectable, inject } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ISchedule } from '../types/entities/schedule.entity';
import { ISchedulePackageRepository } from '../interfaces/repository_interfaces/ISchedulePackage';
import SchedulePackageModel from '../models/schedule.model';
import mongoose from 'mongoose';
import { SCHEDULE_STATUS } from '../shared/constants/constants';

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
      // Overlap condition: existing.start <= newEnd AND existing.end >= newStart
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    };

    if (excludeId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    return this.findOne(query) as Promise<ISchedule | null>;
  }
}
