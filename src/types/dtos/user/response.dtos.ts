import { CancellationPolicies, DifficultyLevel } from 'types/entities/base-package.entity';
import { PublicPackageSummary } from '../../../types/user/types';
import { PackageStatus } from 'types/type';
import { PricingType } from 'types/entities/schedule.entity';
import { ScheduleStatus } from 'shared/constants/constants';

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
  cancellationPolicy: CancellationPolicies | undefined;
  status: PackageStatus;
  isActive: boolean;
}

export interface SchedulePricingDTO {
  type: PricingType;
  peopleCount: number;
  price: number;
}

export interface PublicScheduleDTO {
  scheduleId: string;
  startDate: Date;
  endDate: Date;
  status: ScheduleStatus;
  seatsRemaining: number;
  pricing: SchedulePricingDTO[];
}
// ====== vendor public profile =========
export interface VendorPublicProfileVendorDTO {
  businessName: string;
  profilePhoto: string | null;
  about: null; // future field — not in model yet
  location: string | null;
  averageRating: number;
  totalPackages: number;
  totalTripsCompleted: number;
  createdAt: Date;
  isVerified: boolean;
}

export interface VendorPublicProfileResponseDTO {
  vendor: VendorPublicProfileVendorDTO;
  packages: PublicPackageSummary[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}
