import { ISchedule, ISchedulePopulated } from 'types/entities/schedule.entity';
import { IBaseRepository } from './IBaseRepository';
import { FilterType } from 'types/db';
import mongoose, { UpdateResult } from 'mongoose';

export interface ISchedulePackageRepository extends IBaseRepository<ISchedule> {
  findOverlapping(
    packageId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<ISchedule | null>;

  findSchedulesWithPackage(
    filters: FilterType,
    vendorId: string,
  ): Promise<{ schedules: ISchedulePopulated[]; total: number }>;

  getStatusCounts(vendorId: string): Promise<Record<string, number>>;

  findPublicSchedulesByPackage(packageId: string): Promise<ISchedule[]>;

  countCompletedByVendor(vendorId: string): Promise<number>;

  holdSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult>;

  releaseHeldSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult>;

  confirmSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult>;

  cancelSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult>;
}
