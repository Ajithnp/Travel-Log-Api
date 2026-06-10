import { FilterType, PublicPackageFilters} from 'types/db';
import {
  DifficultyLevel,
  IBasePackageEntity,
  IFile,
} from '../../types/entities/base-package.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose from 'mongoose';
import { PublicPackageImageDTO } from '../../types/user/types';
import { Types } from 'mongoose';
import { PackageStatus } from '../../shared/constants/constants';
import { PaginatedCommissionOverviewByPackages } from '../../interfaces/service_interfaces/admin/IAdminFinanceService';
import { PackagesEarningsByVendor } from '../../interfaces/service_interfaces/vendor/IVendorRevenueService';
import { PaginatedData } from '../../types/common/IPaginationResponse';

export interface IBasePackageRepository extends IBaseRepository<IBasePackageEntity> {
  findPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<{ requests: IPackageListItem[]; total: number }>;

  findPublicPackages(filters: PublicPackageFilters): Promise<{
    packages: RawPublicPackageDocument[];
    total: number;
  }>;

  findVendorPublicPackages(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{ packages: RawPublicPackageDocument[]; total: number }>;

  softDelete(id: Types.ObjectId, vendorId: string): Promise<IBasePackageEntity | null>;

  restore(id: string, vendorId: string): Promise<IBasePackageEntity | null>;

  getPackagesOversight(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ packages: AdminPackageOversightResult[]; total: number }>;

  getPackageDetails(packageId: string): Promise<AdminPackageDetailsResult | null>;

  findPackagesByVendorIdForOffer(vendorId: string): Promise<PackageOfferInfo[]>;

  getCommissionOverviewByPackages(
      page: number,
      limit: number,
      search?: string,
    ): Promise<PaginatedCommissionOverviewByPackages>;

  getPackagesEarningOverviewByVendor(
      vendorId: string,
      page: number,
      limit: number,
      search?: string,
    ): Promise<PaginatedData<PackagesEarningsByVendor>>  
}

export interface AdminPackageDetailsResult {
  _id: string;
  packageName: string;
  location: string;
  state: string;
  days: number;
  nights: number;
  difficultylevel: DifficultyLevel;
  vendorName: string;
  categoryName: string;
  categoryIsActive: boolean;
  totalScedule: number;
  cancellationPolicyLabel: string;
  status: PackageStatus;
  pricing: {
    priceTier: string;
    peopleCount: number;
    price: number;
  }[];
}

export interface AdminPackageOversightResult {
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
export interface RawPublicPackageDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  state?: string;
  difficultyLevel?: string;
  days?: number;
  nights?: number;
  usp?: string;
  images?: PublicPackageImageDTO[];
  category?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    icon?: string;
  };
  vendor?: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
  startingFromPrice?: number;
  earliestDate?: Date;
  earliestEndDate?: Date;
  earliestScheduleStatus?: string;
  scheduleCount?: number;
  isSoldOut?: boolean;
  hasOffer?: boolean;
  offerPercentage?: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface PackageOfferInfo {
  _id: Types.ObjectId;
  title: string;
  hasOffer: boolean;
  offerValue?: number;
}

export interface IPackageListItem {
  _id: string;
  title: string;
  location: string;
  basePrice: number;
  state: string;
  status: string;
  days: string;
  nights: string;
  difficultyLevel: string;
  images: IFile[];
  createdAt: Date;
  categoryId: { name: string } | null;
  cancellationPolicy: { _id: string; label: string; key: string } | null;
  hasOffer: boolean;
  offerPercentage: number;
  scheduleCount: number;
}
