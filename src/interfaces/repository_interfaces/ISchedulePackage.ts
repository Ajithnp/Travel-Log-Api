import { ISchedule, ISchedulePopulated } from '../../types/entities/schedule.entity';
import { IBaseRepository } from './IBaseRepository';
import { FilterType } from '../../types/db';
import mongoose, { UpdateResult } from 'mongoose';
import { ScheduleStatus } from '../../shared/constants/constants';
import { PayoutScheduleListResponseDto } from 'interfaces/service_interfaces/IPayoutService';

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

  confirmSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<ISchedule | null>;

  cancelSeats(
    scheduleId: string,
    seatsCount: number,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult>;

  updateScheduleStatus(
    scheduleId: string,
    status: ScheduleStatus,
    session?: mongoose.ClientSession,
  ): Promise<UpdateResult>;

  getPackageSchedules(
    packageId: string,
    page: number,
    limit: number,
    filter?: ScheduleStatus,
  ): Promise<{ schedules: PackageScheduleResult[]; total: number }>;

  getSchedulesAll(
    page: number,
    limit: number,
    filter?: ScheduleStatus,
    search?: string,
  ): Promise<{ schedules: SchedulesResponseResult[]; total: number }>;

  getPayoutSchedulesCount(): Promise<number>;

  getSchedulesForPayout(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ schedules: PayoutScheduleListResponseDto[]; total: number }>;

  markSchedulePayoutAsCompleted(
    scheduleId: string,
    payoutId: mongoose.Types.ObjectId,
  ): Promise<ISchedule | null>;

  scheduledStatsByVendor(vendorId: string): Promise<ScheduledStatsResult>;

  getUpcomingSchedules(vendorId: string, limit?: number): Promise<UpcomingScheduleResult[]>;

  getScheduleStats(): Promise<{ activeSchedules: number; completedSchedules: number }>;
}

export interface SchedulesResponseResult {
  _id: string;
  packageTittle: string;
  packageLocation: string;
  totalDays: number;
  vendorName: string;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  totalBooked: number;
  totalRevanue: number;
  status: ScheduleStatus;
}

export interface PackageScheduleResult {
  _id: string;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  totalRevanue: number;
  bookingsCount: number;
  soldSeats: number;
  status: string;
}

export interface ScheduledStatsResult {
  totalSchedule: number;
  currentMonthSchedule: number;
  hasGrowth: boolean;
  activeSchedule: number;
  ongoingSchedule: number;
}

export interface UpcomingScheduleResult {
  _id: string;
  startDate: Date;
  endDate: Date;
  packageTitle: string;
  status: ScheduleStatus;
  bookedCount: number;
  totalSeats: number;
}
