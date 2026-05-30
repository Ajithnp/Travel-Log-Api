import { DifficultyLevel } from '../../../types/entities/base-package.entity';
import { AdminPackageDetailsResult } from '../../../interfaces/repository_interfaces/IBasePackageRepository';
import { ScheduleStatus } from '../../../types/entities/schedule.entity';
import { PaginatedData } from '../../../types/common/IPaginationResponse';
import { PackageStatus } from 'shared/constants/constants';

export interface IAdminVendorPackageOversightService {
  getPackages(page: number, limit: number, search?: string): Promise<PackagesOversightResponseDTO>;
  getPackageDetails(packageId: string): Promise<AdminPackageDetailsResponseDTO>;
  getPackageSchedules(
    packageId: string,
    page: number,
    limit: number,
    filter?: ScheduleStatus,
  ): Promise<PaginatedData<PackageScheduleResponseDTO>>;
  getPackageScheduleStats(): Promise<ScheduleStatsResponseDTO>;
  getSchedules(
    page: number,
    limit: number,
    filter?: ScheduleStatus,
    search?: string,
  ): Promise<PaginatedData<SchedulesResponseDTO>>;
}

export interface ScheduleStatsResponseDTO {
  totalSchedules: number;
  upcomingSchedules: number;
  completedSchedules: number;
  soldOutSchedules: number;
}

export interface SchedulesResponseDTO {
  packageTittle: string;
  packageLocation: string;
  totalDays: number;
  vendorName: string;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  totalBooked: number;
  totalRevanue: number;
  status: ScheduleStatus;
}

export type AdminPackageDetailsResponseDTO = AdminPackageDetailsResult;

export interface PackageScheduleResponseDTO {
  _id: string;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  totalRevanue: number;
  bookingsCount: number;
  soldSeats: number;
  status: string;
}

export interface PackagesOversightResponseDTO extends PaginatedData<VendorsPackagesResponseDTO> {
  totalPublished: number;
}

export interface VendorsPackagesResponseDTO {
  _id: string;
  packageName: string;
  location: string;
  state: string;
  status: PackageStatus;
  totalDays: number;
  difficultylevel: DifficultyLevel;
  vendorName: string;
  categoryName: string;
  scheduleCount: number;
}
