import { FilterType, PublicPackageFilters } from 'types/db';
import {
  IBasePackageEntity,
  IBasePackagePopulated,
} from '../../types/entities/base-package.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose from 'mongoose';
import { PublicPackageImageDTO } from 'types/user/types';
import { Types } from 'mongoose';

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

  softDelete(id:Types.ObjectId, vendorId:string): Promise<IBasePackageEntity | null>
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
