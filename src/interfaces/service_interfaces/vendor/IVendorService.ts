import { VendorProfileResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import { UpdateProfileLogoRequestDTO } from '../../../types/dtos/vendor/request.dtos';
import { VendorRevenueStats } from 'interfaces/repository_interfaces/IPayoutRepository';
import { ScheduledStatsResult } from 'interfaces/repository_interfaces/ISchedulePackage';


export interface IVendorService {
  profile(userId: string): Promise<VendorProfileResponseDTO>;

  updateProfileLogo(vendorId: string, payload: UpdateProfileLogoRequestDTO): Promise<void>;
  getSummaryStats(vendorId:string):Promise<VendorDashBoardStatsDTO>
}

export interface VendorDashBoardStatsDTO {
 revanueStats : VendorRevenueStats,
 totalBookings:number;
 totalPackages:number;
 scheduleStats : ScheduledStatsResult;
}