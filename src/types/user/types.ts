import { DifficultyLevel } from '../../types/entities/base-package.entity';

export interface PublicPackageCategoryDTO {
  _id: string;
  name: string;
  slug: string;
  icon?: { key: string };
}
export interface PublicPackageVendorDTO {
  _id: string;
  name: string;
}
export interface PublicPackageImageDTO {
  key: string;
}
export interface PublicPackageSummary {
  _id: string;
  title: string;
  description: string;
  location: string;
  state: string;
  difficultyLevel: DifficultyLevel;
  days: number;
  nights: number;
  usp: string;
  images: PublicPackageImageDTO[];
  category: PublicPackageCategoryDTO;
  vendor: PublicPackageVendorDTO;
  startingFromPrice: number;
  earliestDate: Date;
  earliestEndDate: Date;
  earliestScheduleStatus: 'upcoming' | 'sold_out';
  scheduleCount: number; // total active schedules (upcoming + sold_out)
  isSoldOut: boolean;
  averageRating: number;
  totalReviews: number;
}
