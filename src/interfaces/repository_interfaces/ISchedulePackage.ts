import { ISchedule, ISchedulePopulated } from 'types/entities/schedule.entity';
import { IBaseRepository } from './IBaseRepository';
import { FilterType } from 'types/db';

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

}
