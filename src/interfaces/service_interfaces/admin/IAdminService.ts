export interface IAdminService {

    dashboardStats():Promise<AdminDashboardStatsResponseDto>
    
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
