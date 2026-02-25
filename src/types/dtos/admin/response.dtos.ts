import { IFile } from 'types/entities/base-package.entity';
import { PackageStatus } from '../../../types/type';
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
