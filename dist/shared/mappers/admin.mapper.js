"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMapper = void 0;
class AdminMapper {
    static toVendorProfileResponse(vendor) {
        return {
            id: vendor.userId._id.toString(),
            name: vendor.userId.name,
            email: vendor.userId.email,
            phone: vendor.userId.phone,
            isBlocked: vendor.userId.isBlocked,
            blockedReason: vendor.reasonForReject || '',
            vendorInfo: {
                contactPersonName: vendor.businessInfo.contactPersonName,
                businessAddress: vendor.businessInfo.businessAddress,
                bio: vendor.businessInfo.bio || '',
                status: vendor.status,
                isProfileVerified: vendor.isProfileVerified,
                profileLogo: vendor.documents.profileLogo.key,
                createdAt: vendor.createdAt.toString(),
                updatedAt: vendor.updatedAt.toString(),
            },
            bankDetails: {
                accountNumber: vendor.bankDetails.accountNumber,
                ifsc: vendor.bankDetails.ifsc,
                accountHolderName: vendor.bankDetails.accountHolderName,
                bankName: vendor.bankDetails.bankName,
                branch: vendor.bankDetails.branch,
            },
            createdAt: vendor.createdAt.toString(),
            updatedAt: vendor.updatedAt.toString(),
        };
    }
}
exports.AdminMapper = AdminMapper;
