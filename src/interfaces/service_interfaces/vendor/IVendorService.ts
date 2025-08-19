import { VendorVerificationDTO } from "validators/vendor.verification.schema"
import { IVendor } from "../../../types/IVendor";
import { IVendorVerificationResponseDTO } from "../../../dtos/vendor/vendor.verification.response.dtos";

export interface IVendorService {
    vendorVerificationSubmitService(vendorId:string, verificationData: VendorVerificationDTO, files:any): Promise<IVendorVerificationResponseDTO>;
}