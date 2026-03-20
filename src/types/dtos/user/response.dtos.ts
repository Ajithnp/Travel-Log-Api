import { PublicPackageSummary } from '../../../types/user/types';

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

export interface PublicPackageListResponse {
  packages: PublicPackageSummary[];
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
