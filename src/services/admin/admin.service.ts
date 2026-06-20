import { inject, injectable } from "tsyringe";
import { AdminDashboardStatsResponseDto, DashboardActionsRequiredResponseDto, DashboardTopPerformersDto, IAdminService, PlatformRevanueTrendResponseDto, TrendChartDataPoint } from "interfaces/service_interfaces/admin/IAdminService";
import { IBasePackageRepository } from "../../interfaces/repository_interfaces/IBasePackageRepository";
import { ISchedulePackageRepository } from "../../interfaces/repository_interfaces/ISchedulePackage";
import { IBookingRepository } from "../../interfaces/repository_interfaces/IBookingRepository";
import { IUserRepository } from "../../interfaces/repository_interfaces/IUserRepository";
import { IVendorInfoRepository } from "../../interfaces/repository_interfaces/IVendorInfoRepository";
import { USER_ROLES } from "../../shared/constants/roles";
import { IPayoutRepository } from "../../interfaces/repository_interfaces/IPayoutRepository";
import { PACKAGE_STATUS, PAYOUT_STATUS } from "../../shared/constants/constants";
import { VENDOR_VERIFICATION_STATUS } from "../../types/enum/vendor-verfication-status.enum";
import { CANCELATION_STATUS } from "../../shared/constants/booking";
import { getDateRange, getGranularity } from "../../shared/utils/date.helper";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('IBasePackageRepository')
    private _packageRepository: IBasePackageRepository,
    @inject('ISchedulePackageRepository')
    private _scheduleRepository: ISchedulePackageRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IPayoutRepository')
    private _payoutRepository: IPayoutRepository,

  ) { }

  async dashboardStats(): Promise<AdminDashboardStatsResponseDto> {

    const [users, activeVendors, payout, activePackages, scheduleStats] = await Promise.all([
      this._userRepository.countDocuments({ role: USER_ROLES.USER, isBlocked: false, isEmailVerified: true }),
      this._vendorInfoRepository.findActivevendors(),
      this._payoutRepository.getTotalEarnings(),
      this._packageRepository.countDocuments({ status: PACKAGE_STATUS.PUBLISHED, isDeleted: false }),
      this._scheduleRepository.getScheduleStats()
    ])

    return {
      totalUsers: users,
      totalVendors: activeVendors,
      totalBookings: payout.totalBookings,
      totalRevenue: payout.totalCommission,
      totalVendorEarnings: payout.totalVendorEarnings,
      activePackages: activePackages,
      totalScheduleCompleted: scheduleStats.completedSchedules,
      activeSchedules: scheduleStats.activeSchedules
    };
  };

  async dashboardTopPerformers(): Promise<DashboardTopPerformersDto> {

    const [top5Vendors, top5Packages] = await Promise.all([
      this._vendorInfoRepository.findTop5Vendors(),
      this._payoutRepository.findTop5Packages()
    ])

    return {
      top5Vendors,
      top5Packages
    };
  };

  async dashboardActionsRequired(): Promise<DashboardActionsRequiredResponseDto> {

    const [pendingVendorVerifications, pendingCancellationRequests, pendingPayouts, failedPayouts] = await Promise.all([
      this._vendorInfoRepository.countDocuments({ status: VENDOR_VERIFICATION_STATUS.UNDER_REVIEW }),
      this._bookingRepository.countDocuments({ cancellationStatus: CANCELATION_STATUS.PENDING }),
      this._scheduleRepository.getPayoutSchedulesCount(),
      this._payoutRepository.countDocuments({ status: PAYOUT_STATUS.FAILED })
    ]);

    return {
      pendingVendorVerifications,
      pendingCancellationRequests,
      pendingPayouts,
      failedPayouts
    };

  };

  async dashboardRevenueTrend(period: string, customFrom?: string, customTo?: string): Promise<PlatformRevanueTrendResponseDto> {
    const customFromDate = customFrom ? new Date(customFrom) : undefined;
    const customToDate = customTo ? new Date(customTo) : undefined;
    const { from, now } = getDateRange(period, customFromDate, customToDate);
    const granularity = getGranularity(from, now, period);

    const revenueTrend = await this._payoutRepository.platformRevenueTrend(from, now, granularity);

    const trend: TrendChartDataPoint[] = revenueTrend.map((r) => ({
      date: r._id,
      totalRevanue:Math.round(r.totalRevenue),
      totalCommission:Math.round(r.totalCommission),
      totalVendorEarnings:Math.round(r.totalVendorEarnings)
    }));

    return {
      granularity,
      trend
    };
  };




}