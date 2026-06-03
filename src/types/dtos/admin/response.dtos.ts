import { DifficultyLevel, IFile } from 'types/entities/base-package.entity';
import { PackageStatus } from '../../../types/type';
import { CategoryStatus } from '../../../shared/constants/constants';
export interface UserResponseDTO {
  id: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  createdAt: string;
}

// =========== package ==========

export interface PackageForOfferResponseDTO {
  id: string;
  title: string;
  hasOffer: boolean;
  offerValue?: number;
}

export interface BasePackageSingleResponseDTO {
  id: string;
  title: string;
  location: string;
  state: string;
  durationDays: number;
  durationNights: number;
  imageUrl?: IFile[];
  status: PackageStatus;
  category: string;
  difficultyLevel: string;
  basePrice: number;
  hasOffer: boolean;
  offerPercentage: number;
  scheduleCount: number;
}

export interface PackageScheduleContextResponseDTO {
  PackageId: string;
  title: string;
  location: string;
  state: string;
  days: number;
  nights: number;
  status: PackageStatus;
  category: string;
  difficultyLevel: string;
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

export interface CancellationPolicyRule {
  daysBeforeTrip: number;
  refundPercent: number;
}

export interface CancellationPolicyType {
  _id: string;
  label: string;
  key: string;
  description?: string;
  rules?: CancellationPolicyRule[];
}
export interface PackageDetailDTO {
  packageId: string;
  vendorId: string;
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
  cancellationPolicy: CancellationPolicyType | null;
  status: PackageStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageDetailWithStats extends PackageDetailDTO {
  activeOffer: {
    hasOffer: boolean;
    offerPercentage: number;
    offerId: string | null;
  };
  reviewStats: {
    average: number;
    total: number;
  };
  scheduleCount: number;
}

//======= category =========
export interface CategoryResponseDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: IFile | null;
  isActive: boolean;
  status: CategoryStatus;
  createdBy: string | null;
  requestedBy: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryRequestResponseDTO {
  id: string;
  name: string;
  requested: {
    name: string;
    email: string;
  } | null;
  vendorNote: string | null;
  date: string;
  status: CategoryStatus;
}

export interface CategoryRequestReviewedResponseDTO {
  id: string;
  name: string;
  requested: {
    name: string;
    email: string;
  } | null;
  adminNote: string | null;
  updatedDate: string;
  status: CategoryStatus;
}
