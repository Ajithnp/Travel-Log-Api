import { PaginatedData } from '../../../types/common/IPaginationResponse';
// import { IVendor } from "../../../types/IVendor";
import { IVendorInfoResponseDTO } from '../../../types/dtos/vendor/vendor.info.response.dtos';
import { VendorVerificationUpdateDTO } from 'types/dtos/admin/request.dtos';
import { UserResponseDTO } from '../../../types/dtos/admin/response.dtos';

export interface IAdminVendorService {
  vendorVerificationRequests(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<IVendorInfoResponseDTO>>>;

  updateVendorVerification(vendorId: string, paload: VendorVerificationUpdateDTO): Promise<void>;

  getVendors(page: number, limit: number, search: string): Promise<PaginatedData<UserResponseDTO>>;

  updateVendorAccess(id: string, block: boolean, reason?: string, token?: string): Promise<void>;
}
