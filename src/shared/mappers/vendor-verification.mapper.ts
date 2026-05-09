import { IVendorVerificationResponse} from "../../interfaces/service_interfaces/vendor/IvendorVerificationService";
import { IVendorInfo } from "../../types/entities/vendor.info.entity";

export class VendorverificationMapper {

  static toVendorRejectedResponse(
    vendor: IVendorInfo
  ): IVendorVerificationResponse {
    return {
      id: vendor._id.toString(),
      gstin: vendor.businessInfo.GSTIN,
      ownerName: vendor.businessInfo.contactPersonName,
      businessAddress: vendor.businessInfo.businessAddress,
      bio: vendor.businessInfo.bio,

      accountNumber: vendor.bankDetails.accountNumber,
      ifsc: vendor.bankDetails.ifsc,
      bankName: vendor.bankDetails.bankName,
      branch: vendor.bankDetails.branch,
      accountHolderName: vendor.bankDetails.accountHolderName,

      businessLicence: vendor.documents.businessLicence,
      businessPan: vendor.documents.businessPan,
      companyLogo: vendor.documents.profileLogo,
      ownerIdentityProof: vendor.documents.ownerIdentity,

      status: vendor.status,
      rejectedReason: vendor.reasonForReject ?? "",
    };
  }
}
