import { VendorVerificationDTO } from "validators/vendor.verification.schema"

export interface IVendorService {
    vendorVerificationSubmitService(vendorId:string, verificationData: VendorVerificationDTO, files:any): Promise<void>;
}