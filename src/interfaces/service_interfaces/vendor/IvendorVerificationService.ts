import { VendorVerificationRequestDTO } from "types/dtos/vendor/request.dtos";
import { IFiles, VendorStatus } from "../../../types/entities/vendor.info.entity";
import { IVendorVerificationResponseDTO } from "types/dtos/vendor/vendorVerificationResponse.dtos";

export interface IVendorVerificationService {
  getVerificationData(vendorId: string): Promise<void>
  getRejectedVendor(vendorId: string): Promise<IVendorVerificationResponse>
 vendorVerificationSubmit(
    vendorId: string,
    verificationData: VendorVerificationRequestDTO,
  ): Promise<IVendorVerificationResponseDTO>;
  vendorVerificationReapply(
    vendorId: string,
    vendorInfoId:string,
    verificationData: VendorVerificationRequestDTO,
  ): Promise<IVendorVerificationResponseDTO>;
}

// response dtos

export interface IVendorVerificationResponse {
  id: string;
  gstin: string;
  ownerName: string;
  businessAddress: string;
  bio: string;

  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
  accountHolderName: string;

  businessLicence?: IFiles;
  businessPan?: IFiles;
  companyLogo?: IFiles;
  ownerIdentityProof?: IFiles;
    
  status: VendorStatus;
  rejectedReason: string;
}