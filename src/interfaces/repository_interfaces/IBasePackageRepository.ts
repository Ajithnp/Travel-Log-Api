import { FilterType, PublicPackageFilters } from 'types/db';
import {
  DifficultyLevel,
  IBasePackageEntity,
  IBasePackagePopulated,
} from '../../types/entities/base-package.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose from 'mongoose';
import { PublicPackageImageDTO } from '../../types/user/types';
import { Types } from 'mongoose';
import { PackageStatus } from 'shared/constants/constants';

export interface IBasePackageRepository extends IBaseRepository<IBasePackageEntity> {
  findPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<{ requests: IBasePackagePopulated[]; total: number }>;

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

  getAdminPackagesOversight(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ packages: AdminPackageOversightResult[]; total: number }>;

  getPackageDetails(packageId: string): Promise<AdminPackageDetailsResult | null>;
}

export interface AdminPackageDetailsResult {
  _id: string;
  packageName: string;
  location: string;
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
    price: number;
  }[];
}

export interface AdminPackageOversightResult {
  _id: string;
  packageName: string;
  location: string;
  state: string;
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
  averageRating?: number;
  totalReviews?: number;
}
