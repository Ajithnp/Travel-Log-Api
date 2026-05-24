import { FilterType } from '../../../types/db';
import { CreateScheduleInputDTO } from '../../../types/dtos/vendor/request.dtos';
import { ScheduleListResponseDTO, PaginatedData } from '../../../types/common/IPaginationResponse';
import { ScheduleResponse, VendorScheduleBookingSummaryDTO, ScheduleBookingDetailDTO, ScheduleBookingSingleDetailDTO, ScheduleStatusResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import { ScheduleStatus } from '../../../types/entities/schedule.entity';

export interface ISchedulePackageService {
  createSchedule(vendorId: string, data: CreateScheduleInputDTO): Promise<void>;
  fetchVendorSchedules(vendorId: string, filters: FilterType): Promise<ScheduleListResponseDTO>;
  getSchedule(scheduleId: string, vendorId: string): Promise<ScheduleResponse>;
  getVendorScheduleBookingSummary(scheduleId: string, vendorId: string): Promise<VendorScheduleBookingSummaryDTO>;
  getScheduleBookings(scheduleId: string, vendorId: string, page: number, limit: number, search?: string, filter?:string): Promise<PaginatedData<ScheduleBookingDetailDTO>>;
  getScheduleBookingDetails(scheduleId: string, bookingId: string, vendorId: string): Promise<ScheduleBookingSingleDetailDTO>;
  updateScheduleStatus(scheduleId: string, vendorId: string, status: ScheduleStatus): Promise<ScheduleStatusResponseDTO>;
}

