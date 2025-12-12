import { IVendorVerificationResponseDTO } from '../../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { VendorProfileResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import { VendorVerificationRequestDTO , UpdateProfileLogoRequestDTO} from '../../../types/dtos/vendor/request.dtos';
export interface IVendorService {
  profile(userId: string): Promise<VendorProfileResponseDTO>;

  updateProfileLogo(vendorId:string,payload: UpdateProfileLogoRequestDTO):Promise<void>

  vendorVerificationSubmit(
    vendorId: string,
    verificationData: VendorVerificationRequestDTO,
  ): Promise<IVendorVerificationResponseDTO>;
}
