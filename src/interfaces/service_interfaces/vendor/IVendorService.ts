import { VendorProfileResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import { UpdateProfileLogoRequestDTO } from '../../../validators/vendor/profile.validation';
import { VendorRevenueStats } from 'interfaces/repository_interfaces/IPayoutRepository';
import { ScheduledStatsResult, UpcomingScheduleResult } from 'interfaces/repository_interfaces/ISchedulePackage';
import { RecentBookingActivityResult } from 'interfaces/repository_interfaces/IBookingRepository';
import { Granularity } from 'shared/utils/date.helper';


export interface IVendorService {
  
  profile(userId: string): Promise<VendorProfileResponseDTO>;
  updateProfileLogo(vendorId: string, payload: UpdateProfileLogoRequestDTO): Promise<void>;
  getSummaryStats(vendorId:string):Promise<VendorDashBoardStatsDTO>
  getDashboardAnalytics(vendorId: string, period?: string, customFrom?:Date, customTo?: Date): Promise<DashboardAnalyticsResponseDTO>;
  dashboardRecentActivity(vendorId:string):Promise<RecentBookingActivityResponseDTO>
}

export interface VendorDashBoardStatsDTO {
 revanueStats : VendorRevenueStats,
 totalBookings:number;
 totalPackages:number;
 scheduleStats : ScheduledStatsResult;
}

export interface ChartDataPoint {
  date: string;
  bookings: number;
  revenue: number;
}

export type BookingByPackage = {
  packageTitle: string;
  bookingCount: number;
}

export interface DashboardAnalyticsResponseDTO {
  granularity: Granularity;
  trend: ChartDataPoint[];            
  bookingsByPackage: BookingByPackage[];
}

export interface RecentBookingActivityResponseDTO {
  bookings: RecentBookingActivityResult[];
  schedules: UpcomingScheduleResult[];
  
}