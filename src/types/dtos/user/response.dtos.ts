import { DifficultyLevel } from 'types/entities/base-package.entity';
import { PublicPackageSummary } from '../../../types/user/types';
import { PackageStatus } from 'types/type';

export interface UserProfileResponseDTO {
  id: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface IUpdateEmailResponseDTO {
  email: string;
  otpExpiresIn: number;
  serverTime: number;
}

// ====== package =========
export interface PublicPackageListResponse {
  packages: PublicPackageSummary[];
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ActivityDTO {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: string;
  specials: string[];
  included: boolean;
}

export interface ItineraryDayDTO {
  dayNumber: number;
  title: string;
  activities: ActivityDTO[];
}

export interface PopulatedVendor {
  id: string;
  name: string;
}
export interface PublicPackageDetailDTO {
  packageId: string;
  vendor: PopulatedVendor;
  title: string;
  location: string;
  state: string;
  usp: string;
  category: string | null;
  difficultyLevel: DifficultyLevel | undefined;
  description: string;
  days: string;
  nights: string;
  basePrice: string;
  images: { key: string }[];
  itinerary: ItineraryDayDTO[];
  inclusions: string[];
  exclusions: string[];
  packingList: string[];
  cancellationPolicy: string | null;
  status: PackageStatus;
  isActive: boolean;
}
