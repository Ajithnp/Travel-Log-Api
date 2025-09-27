import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { inject, injectable } from 'tsyringe';
import { VendorVerificationDTO } from 'validators/vendor.verification.schema';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import {
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
} from '../../shared/utils/cloudinary.helper';
import { IVendorInfo } from 'types/IVendor';
import mongoose, { Types } from 'mongoose';
import { IVendorVerificationResponseDTO } from '../../dtos/vendor/vendorVerificationResponse.dtos';
import { IVendorProfileResponseDTO } from 'dtos/vendor/vendorProfileResponse.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { VENDOR_STATUS } from '../../shared/constants/common';
import { USER_ROLES } from '../../shared/constants/roles';

@injectable()
export class VendorService implements IVendorService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
  ) {}

  async profileService(id: string): Promise<IVendorProfileResponseDTO> {
    const vendorDoc = await this._vendorInfoRepository.findByUserId(id);
    if (!vendorDoc || vendorDoc.status === VENDOR_STATUS.Pending || vendorDoc.status === VENDOR_STATUS.Rejected) {
      const userDoc = await this._userRepository.findById(id);

      if (!userDoc) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      return {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        profileLogo: null,
        businessAddress: null,
        contactPersonName: null,
        isProfileVerified: false,
        status: vendorDoc?.status ? vendorDoc.status : 'NotSubmitted',
        reasonForReject:vendorDoc?.reasonForReject ? vendorDoc.reasonForReject: "",
        createdAt: userDoc.createdAt,
        
      };
    }

    return {
      id: vendorDoc._id.toString(),
      name: vendorDoc.userId.name,
      email: vendorDoc.userId.email,
      phone: vendorDoc.userId.phone,
      profileLogo: vendorDoc.profileLogo?.url,
      businessAddress: vendorDoc.businessAddress,
      contactPersonName: vendorDoc.contactPersonName,
      isProfileVerified: vendorDoc.isProfileVerified,
      status: vendorDoc.status,
      reasonForReject: vendorDoc?.reasonForReject ? vendorDoc.reasonForReject : "",
      createdAt: vendorDoc?.createdAt,
    };
  }

  async vendorVerificationSubmitService(
    vendorId: string,
    verificationData: VendorVerificationDTO,
    files: any,
  ): Promise<IVendorVerificationResponseDTO> {
    let vendorDocs = await this._vendorInfoRepository.findOne({
      userId: new Types.ObjectId(vendorId),
    });

    if (vendorDocs && vendorDocs.status === VENDOR_STATUS.Rejected) {
      // remove existing files from cloudinary
      const oldDocs = [
        vendorDocs.businessLicence,
        vendorDocs.businessPan,
        vendorDocs.profileLogo,
        vendorDocs.ownerIdentity,
      ];

      for (const doc of oldDocs) {
        if (doc?.publicId) {
          await deleteFromCloudinary(doc.publicId);
        }
      }
    }
    // Upload files to Cloudinary

    const uploadedDocs = await uploadMultipleToCloudinary(
      {
        businessLicence: files.businessLicence,
        businessPan: files.businessPan,
        companyLogo: files.companyLogo,
        ownerIdentity: files.ownerIdentity,
      },
      vendorId,
      USER_ROLES.VENDOR,
    );

    const vendorData: Partial<IVendorInfo> = {
      userId: new Types.ObjectId(vendorId),
      GSTIN: verificationData.gstin,
      businessAddress: verificationData.businessAddress,
      contactPersonName: verificationData.ownerName,
      businessLicence: uploadedDocs.businessLicence,
      businessPan: uploadedDocs.businessPan,
      profileLogo: uploadedDocs.companyLogo,
      ownerIdentity: uploadedDocs.ownerIdentity,
      status: VENDOR_STATUS.Pending,
      reasonForReject: ""
    };

    if (!vendorDocs) {
      vendorDocs = await this._vendorInfoRepository.create({
        userId: new Types.ObjectId(vendorId),
        ...vendorData,
      });
    } else {
      if (vendorDocs.status === VENDOR_STATUS.Approved) {
        throw new AppError(
          ERROR_MESSAGES.VENDOR_VERIFICARION_STATUS_APPROVED,
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      if (vendorDocs.status === VENDOR_STATUS.Pending) {
        throw new AppError(
          ERROR_MESSAGES.VENDOR_VERIFICATION_STATUS_PENDING,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      vendorDocs.set(vendorData);
      await vendorDocs.save();
    }
    return {
      isProfileVerified: vendorDocs.isProfileVerified,
    };
  }
}
