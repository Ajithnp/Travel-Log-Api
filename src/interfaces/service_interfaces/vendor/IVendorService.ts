import { VendorProfileResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import { UpdateProfileLogoRequestDTO } from '../../../types/dtos/vendor/request.dtos';
import { VendorRevenueStats } from 'interfaces/repository_interfaces/IPayoutRepository';
import { ScheduledStatsResult } from 'interfaces/repository_interfaces/ISchedulePackage';
import { RecentBookingActivityResult } from 'interfaces/repository_interfaces/IBookingRepository';



export interface IVendorService {
  profile(userId: string): Promise<VendorProfileResponseDTO>;

  updateProfileLogo(vendorId: string, payload: UpdateProfileLogoRequestDTO): Promise<void>;
  getSummaryStats(vendorId:string):Promise<VendorDashBoardStatsDTO>
  dashboardChartsData(vendorId: string, period?: string): Promise<DashboardChartResponseDTO>;
  dashboardRecentActivity(vendorId:string):Promise<RecentBookingActivityResponseDTO>
}

export interface VendorDashBoardStatsDTO {
 revanueStats : VendorRevenueStats,
 totalBookings:number;
 totalPackages:number;
 scheduleStats : ScheduledStatsResult;
}

export interface DashboardChartResponseDTO {
  bookingsOverTime: Array<{ date: string; count: number }>;
  revenueOverTime: Array<{ date: string; amount: number }>;
  bookingsByPackage: Array<{ packageTitle: string; bookingCount: number }>;
}

export type RecentBookingActivityResponseDTO = RecentBookingActivityResult[];