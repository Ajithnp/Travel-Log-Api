import { IVendorVerificationResponseDTO } from '../../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { VendorProfileResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import { VendorVerificationDTO } from '../../../validators/vendor.verification.schema';

export interface IVendorService {
  profile(userId: string): Promise<VendorProfileResponseDTO>;

  vendorVerificationSubmit(
    vendorId: string,
    verificationData: VendorVerificationDTO,
    files: any,
  ): Promise<IVendorVerificationResponseDTO>;
}
