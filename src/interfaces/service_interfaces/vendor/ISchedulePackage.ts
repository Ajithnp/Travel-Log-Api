import { FilterType } from 'types/db';
import { CreateScheduleInputDTO } from '../../../types/dtos/vendor/request.dtos';
import { ScheduleListResponseDTO } from '../../../types/common/IPaginationResponse';


export interface ISchedulePackageService {
  createSchedule(vendorId: string, data: CreateScheduleInputDTO): Promise<void>;
  fetchVendorSchedules(vendorId: string, filters: FilterType): Promise<ScheduleListResponseDTO>;
}
