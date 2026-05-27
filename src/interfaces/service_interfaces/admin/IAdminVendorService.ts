import { PaginatedData } from '../../../types/common/IPaginationResponse';
import { IVendorInfoResponseDTO } from '../../../types/dtos/vendor/vendor.info.response.dtos';
import { VendorVerificationUpdateDTO } from 'types/dtos/admin/request.dtos';
import { UserResponseDTO } from '../../../types/dtos/admin/response.dtos';
import { VendorStatus } from 'types/entities/vendor.info.entity';

export interface IAdminVendorService {
  vendorVerificationRequests(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<IVendorInfoResponseDTO>>>;

  updateVendorVerification(vendorId: string, paload: VendorVerificationUpdateDTO): Promise<void>;

  getVendors(
    page: number,
    limit: number,
    search: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<UserResponseDTO>>;

  updateVendorAccess(id: string, block: boolean, reason?: string, token?: string): Promise<void>;

  getVendorProfile(vendorId: string): Promise<VendorProfileResponseDTO>;

  getVendorProfileStats(vendorId: string): Promise<VendorProfileStatsDTO>;
}

export interface VendorProfileStatsDTO {
  totalPackages: number;
  totalScheduleCompleted: number;
  totalEarnings: number;
  averageRating: number;
}

export interface VendorProfileResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  blockedReason: string | null;
  vendorInfo: {
    contactPersonName: string;
    businessAddress: string;
    bio: string;
    status: VendorStatus;
    isProfileVerified: boolean;
    profileLogo: string;
    createdAt: string;
    updatedAt: string;
  };
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
    bankName: string;
    branch: string;
  };
  createdAt: string;
  updatedAt: string;
}
