import { PlatformRevenueTrendResult, TopPerfomingPackagesResult } from "../../../interfaces/repository_interfaces/IPayoutRepository";
import { TopPerformingVendorsResult } from "../../../interfaces/repository_interfaces/IVendorInfoRepository";
import { Granularity } from "../../../shared/utils/date.helper";

export interface IAdminService {

    dashboardStats():Promise<AdminDashboardStatsResponseDto>
    dashboardTopPerformers():Promise<DashboardTopPerformersDto>
    dashboardActionsRequired():Promise<DashboardActionsRequiredResponseDto>
    dashboardRevenueTrend(period:string, customFrom?:string, customTo?:string):Promise<PlatformRevanueTrendResponseDto>  
    
}

export interface AdminDashboardStatsResponseDto {
    totalUsers:number;
    totalVendors:number;
    totalBookings:number;
    totalRevenue:number;
    totalVendorEarnings:number;
    activePackages:number;
    activeSchedules:number;
    totalScheduleCompleted:number;
}

export interface DashboardTopPerformersDto {
    top5Vendors:TopPerformingVendorsResult[],
    top5Packages:TopPerfomingPackagesResult[]
}

export interface DashboardActionsRequiredResponseDto {
    pendingVendorVerifications:number,
    pendingCancellationRequests:number,
    pendingPayouts:number,
    failedPayouts:number,
    
}

export interface TrendChartDataPoint {
  date: string;
  totalRevanue: number;
  totalCommission:number;
  totalVendorEarnings:number;
}


export interface PlatformRevanueTrendResponseDto {
     granularity: Granularity;
     trend:TrendChartDataPoint[]
}
