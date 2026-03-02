import { Document, Types } from 'mongoose';

export type PackageStatus = 'DRAFT' | 'PUBLISHED' | 'SOFT_DELETED';
export interface IFile {
  key: string;
}

export type ActivityType = 'travel' | 'meal' | 'stay' | 'sightseeing' | 'activity' | 'free';

export interface Activity {
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
  location?: string;
  type?: ActivityType;
  included?: boolean;
}
export interface DayItinerary {
  dayNumber?: number;
  title?: string;
  activities?: Activity[];
}

export type PackageCategory = 'weekend' | 'adventure' | 'family' | 'honeymoon';

export type DifficultyLevel = 'easy' | 'moderate' | 'hard';

export interface IBasePackageEntity extends Document {
  vendorId: Types.ObjectId;

  title?: string;
  location?: string;
  pickupLocation?: string;
  usp?: string;
  category?: PackageCategory;

  images?: IFile[];

  days?: string;
  nights?: string;

  basePrice?: string;
  description?: string;

  itinerary?: DayItinerary[];

  inclusions?: string[];
  exclusions?: string[];
  packingList?: string[];
  cancellationPolicy?: 'Flexible' | 'Moderate' | 'Strict' | 'Non-Refundable';

  difficultyLevel?: DifficultyLevel;

  status: PackageStatus;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
