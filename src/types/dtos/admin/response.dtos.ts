import { IFile } from 'types/entities/base-package.entity';
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

export interface BasePackageSingleResponseDTO {
  id: string;
  title: string;
  location: string;
  durationDays: number;
  durationNights: number;
  imageUrl?: IFile[];
  status: PackageStatus;
  category: string;
  difficultyLevel: string;
  basePrice: number;
}

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
