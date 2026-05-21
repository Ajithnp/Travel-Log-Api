import mongoose, { Document, Types } from 'mongoose';

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

export type DifficultyLevel = 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
export type CancellationPolicies = 'Flexible' | 'Moderate' | 'Strict' | 'Non-Refundable';
export interface IBasePackageEntity extends Document {
  _id: mongoose.Types.ObjectId;
  vendorId: Types.ObjectId;
  title?: string;
  location?: string;
  state?: string;
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
  cancellationPolicy?: Types.ObjectId;
  difficultyLevel?: DifficultyLevel;
  status: PackageStatus;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBasePackagePopulated extends Omit<IBasePackageEntity, 'categoryId' | 'cancellationPolicy'> {
  categoryId: { name: string };
  cancellationPolicy: { label: string; key: string; _id: string };
}

export interface PopulatedVendor {
  _id: string;
  name: string;
  email?: string;
}

interface PopulatedCategory {
  _id: string;
  name: string;
  slug?: string;
}
  interface PopulatedCancellationPolicy {
  _id: string;
  label: string;
  key: string;
}
export interface IPopulatedPackageDetails
  extends Omit<IBasePackageEntity, 'vendorId' | 'categoryId' | 'cancellationPolicy'> {
  vendorId: PopulatedVendor;
  categoryId: PopulatedCategory;
  cancellationPolicy: PopulatedCancellationPolicy;
}
