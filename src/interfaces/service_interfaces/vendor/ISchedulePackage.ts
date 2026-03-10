import { CreateScheduleInputDTO } from '../../../types/dtos/vendor/request.dtos';

export interface ISchedulePackageService {
  createSchedule(vendorId: string, data: CreateScheduleInputDTO): Promise<void>;
}
