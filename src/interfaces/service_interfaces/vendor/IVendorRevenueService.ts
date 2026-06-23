import { PaginatedData } from 'types/common/IPaginationResponse';
import { PackageStatus } from 'types/type';

export interface IVendorRevenueService {
  packagesEarningOverview(
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedData<PackagesEarningsByVendor>>;
}

export interface PackagesEarningsByVendor {
  _id: string;
  title: string;
  status: PackageStatus;
  location: string;
  totalScheduled: number;
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  netEarnings: number;
}
