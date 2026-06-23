"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorverificationMapper = void 0;
class VendorverificationMapper {
    static toVendorRejectedResponse(vendor) {
        var _a;
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
            rejectedReason: (_a = vendor.reasonForReject) !== null && _a !== void 0 ? _a : '',
        };
    }
}
exports.VendorverificationMapper = VendorverificationMapper;
