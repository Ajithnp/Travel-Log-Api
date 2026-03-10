import { ISchedule } from 'types/entities/schedule.entity';
import { IBaseRepository } from './IBaseRepository';

export interface ISchedulePackageRepository extends IBaseRepository<ISchedule> {
  // findByIdAndVendor(id: string, vendorId: string): Promise<ISchedule | null>;
  findOverlapping(
    packageId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<ISchedule | null>;
}
