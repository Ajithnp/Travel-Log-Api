import { inject, injectable } from "tsyringe";
import { AdminDashboardStatsResponseDto, IAdminService } from "interfaces/service_interfaces/admin/IAdminService";
import { IBasePackageRepository } from "../../interfaces/repository_interfaces/IBasePackageRepository";
import { ISchedulePackageRepository } from "../../interfaces/repository_interfaces/ISchedulePackage";
import { IBookingRepository } from "../../interfaces/repository_interfaces/IBookingRepository";
import { IUserRepository } from "../../interfaces/repository_interfaces/IUserRepository";
import { IVendorInfoRepository } from "../../interfaces/repository_interfaces/IVendorInfoRepository";
import { USER_ROLES } from "../../shared/constants/roles";
import { IPayoutRepository } from "../../interfaces/repository_interfaces/IPayoutRepository";
import { PACKAGE_STATUS } from "../../shared/constants/constants";

@injectable()
export class AdminService implements IAdminService {
  constructor(
   @inject('IBookingRepository')
   private _bookingRepository:IBookingRepository,
   @inject('IBasePackageRepository')
   private _packageRepository:IBasePackageRepository,
   @inject('ISchedulePackageRepository')
   private _scheduleRepository:ISchedulePackageRepository,
   @inject('IUserRepository')
   private _userRepository:IUserRepository,
   @inject('IVendorInfoRepository')
   private _vendorInfoRepository:IVendorInfoRepository,
   @inject('IPayoutRepository')
   private _payoutRepository:IPayoutRepository,

  ) {}

  async dashboardStats(): Promise<AdminDashboardStatsResponseDto> {
      
    const [users,activeVendors,payout,activePackages,scheduleStats] = await Promise.all([
        this._userRepository.countDocuments({rol:USER_ROLES.USER,isBlocked:false,isEmailVerified:true}),
        this._vendorInfoRepository.findActivevendors(),
        this._payoutRepository.getTotalEarnings(),
        this._packageRepository.countDocuments({status:PACKAGE_STATUS.PUBLISHED, isDeleted:false}),
        this._scheduleRepository.getScheduleStats()
    ])

    return {
        totalUsers: users,
        totalVendors:activeVendors,
        totalBookings:payout.totalBookings,
        totalRevenue:payout.totalCommission,
        totalVendorEarnings:payout.totalVendorEarnings,
        activePackages:activePackages,
        totalScheduleCompleted:scheduleStats.completedSchedules,
        activeSchedules:scheduleStats.activeSchedules
    };

  };



  
}