import { IBaseRepository } from './IBaseRepository';
import { IPayout, PayoutStatus } from '../../types/entities/payout.entity';
import {
  FindAllPayoutsResponseDto,
  PayoutStatsResponseDto,
  VendorPayoutsListResponseDto,
} from '../../interfaces/service_interfaces/IPayoutService';

export interface IPayoutRepository extends IBaseRepository<IPayout> {
  updateStatus(
    payoutId: string,
    status: IPayout['status'],
    extras?: Partial<IPayout>,
  ): Promise<void>;
  payoutStats(): Promise<PayoutStatsResponseDto>;
  findAllPayouts(
    page: number,
    limit: number,
    search?: string,
    filter?: PayoutFilter,
  ): Promise<{ payouts: FindAllPayoutsResponseDto[]; total: number }>;
  findAllPayoutsByVendor(
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
    filter?: PayoutFilter,
  ): Promise<{ payouts: VendorPayoutsListResponseDto[]; total: number }>;
  revenueStatsByVendor(vendorId: string): Promise<VendorRevenueStats>;
  getTotalEarnings(): Promise<{
    totalVendorEarnings: number;
    totalCommission: number;
    totalBookings: number;
  }>;
  findTop5Packages(): Promise<TopPerfomingPackagesResult[]>;
  platformRevenueTrend(
    startDate: Date,
    endDate: Date,
    granularity: string,
  ): Promise<PlatformRevenueTrendResult[]>;
}

export type PayoutFilter = PayoutStatus;

export interface VendorPayoutsListResult {
  payoutId: string;
  scheduleId: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
  packageTittle: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: PayoutStatus;
  scheduledAt: Date;
}

export interface VendorRevenueStats {
  totalRevanue: number;
  currentMonthRevanue: number;
  previousMonthRevanue: number;
  hasGrowth: boolean;
}

export interface TopPerfomingPackagesResult {
  packageId: string;
  packageTitle: string;
  revanueGenerate: number;
  totalScheduleCompleted: number;
}

export interface PlatformRevenueTrendResult {
  _id: string;
  totalRevenue: number;
  totalCommission: number;
  totalVendorEarnings: number;
}
