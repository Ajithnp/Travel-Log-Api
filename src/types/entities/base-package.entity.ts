import { Document, Types } from 'mongoose';
import { PackageStatus } from 'shared/constants/constants';
export interface IFile {
  key: string;
}
export interface Activity {
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
  location?: string;
  specials?: string[];
  included?: boolean;
}
export interface DayItinerary {
  dayNumber?: number;
  title?: string;
  activities?: Activity[];
}


export type DifficultyLevel = 'easy'| 'moderate'| 'challenging'| 'extreme';

export interface IBasePackageEntity extends Document {
  vendorId: Types.ObjectId;

  title?: string;
  location?: string;
  usp?: string;
  categoryId?: Types.ObjectId;

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
