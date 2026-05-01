import { VendorPublicProfileResponseDTO } from '../../../types/dtos/user/response.dtos';

export interface IPublicVendorService {
  getVendorPublicProfile(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<VendorPublicProfileResponseDTO>;
}
