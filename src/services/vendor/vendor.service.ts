import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { inject, injectable } from 'tsyringe';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { VendorVerificationDTO } from '../../validators/vendor.verification.schema';

import { IFiles, IVendorInfo } from '../../types/entities/vendor.info.entity';
import { Types } from 'mongoose';
import { IVendorVerificationResponseDTO } from '../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { USER_ROLES } from '../../shared/constants/roles';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
import {
  UpdateProfileLogoRequestDTO,
  VendorVerificationRequestDTO,
} from '../../types/dtos/vendor/request.dtos';
import { IFileStorageHandlerService } from '../../interfaces/service_interfaces/IFileStorageBusinessService';
@injectable()
export class VendorService implements IVendorService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('IFileStorageHandlerService')
    private _fileStorage: IFileStorageHandlerService,
  ) {}

  async profile(userId: string): Promise<VendorProfileResponseDTO> {
    const vendorDoc = await this._vendorInfoRepository.findVendorWithUserId(userId);

    if (
      !vendorDoc ||
      vendorDoc.status === VENDOR_VERIFICATION_STATUS.PENDING ||
      vendorDoc.status === VENDOR_VERIFICATION_STATUS.REJECTED
    ) {
      const userDoc = await this._userRepository.findById(userId);

      if (!userDoc) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

      return {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.role,
        profileLogo: null,
        businessAddress: null,
        contactPersonName: null,
        isProfileVerified: false,
        status: vendorDoc?.status ? vendorDoc.status : VENDOR_VERIFICATION_STATUS.NOT_SUBMITTED,
        reasonForReject: vendorDoc?.reasonForReject ? vendorDoc.reasonForReject : '',
        createdAt: userDoc.createdAt,
      };
    }

    return {
      id: (vendorDoc._id as Types.ObjectId).toString(),
      name: vendorDoc.userId.name,
      email: vendorDoc.userId.email,
      phone: vendorDoc.userId.phone,
      role: vendorDoc.userId.role,
      profileLogo: vendorDoc.profileLogo?.key,
      businessAddress: vendorDoc.businessAddress,
      contactPersonName: vendorDoc.contactPersonName,
      isProfileVerified: vendorDoc.isProfileVerified,
      userId: (vendorDoc.userId?._id as Types.ObjectId).toString(),
      status: vendorDoc.status,
      reasonForReject: vendorDoc?.reasonForReject ? vendorDoc.reasonForReject : '',
      createdAt: vendorDoc?.createdAt,
    };
  }

  async updateProfileLogo(vendorId: string, payload: UpdateProfileLogoRequestDTO): Promise<void> {
    const vendorDoc = await this._vendorInfoRepository.findVendorWithUserId(vendorId);
    if (!vendorDoc) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // 2. Delete old file from S3 (if exists)
    if (vendorDoc.profileLogo?.key) {
      await this._fileStorage.deleteFile(vendorDoc.profileLogo.key);
    }

    const file = payload.files[0];
    await this._vendorInfoRepository.findByIdAndUpdate(payload.vendorInfoId, {
      profileLogo: { key: file.key },
    });
  }

  async vendorVerificationSubmit(
    vendorId: string,
    verificationData: VendorVerificationRequestDTO,
  ): Promise<IVendorVerificationResponseDTO> {
    let vendorDoc = await this._vendorInfoRepository.findOne({
      userId: new Types.ObjectId(vendorId),
    });

    // Case 1: Vendor already approved — block further changes
    if (vendorDoc?.status === VENDOR_VERIFICATION_STATUS.APPROVED) {
      throw new AppError(
        ERROR_MESSAGES.VENDOR_VERIFICARION_STATUS_APPROVED,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Case 2: Vendor verification already pending
    if (vendorDoc?.status === VENDOR_VERIFICATION_STATUS.PENDING) {
      throw new AppError(
        ERROR_MESSAGES.VENDOR_VERIFICATION_STATUS_PENDING,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Case 3: Vendor rejected — reset old data and re-submit

    if (vendorDoc && vendorDoc.status === VENDOR_VERIFICATION_STATUS.REJECTED) {
      // remove existing files from s3;
      const oldFiles = [
        vendorDoc.businessLicence?.key,
        vendorDoc.businessPan?.key,
        vendorDoc.profileLogo?.key,
        vendorDoc.ownerIdentity?.key,
      ].filter(Boolean) as string[];

      await this._fileStorage.deleteFiles(oldFiles);
    }
    // Prepare new verification data (common for new + rejected cases).
    const vendorData: Partial<IVendorInfo> = {
      userId: new Types.ObjectId(vendorId),
      GSTIN: verificationData.gstin,
      businessAddress: verificationData.businessAddress,
      contactPersonName: verificationData.ownerName,
      status: VENDOR_VERIFICATION_STATUS.PENDING,
      reasonForReject: '',
    };

    const fileFieldMap: Record<string, keyof Partial<IVendorInfo>> = {
      businessLicence: 'businessLicence',
      businessPan: 'businessPan',
      companyLogo: 'profileLogo',
      ownerIdentityProof: 'ownerIdentity',
    };

    verificationData.files.forEach((file) => {
      const field = fileFieldMap[file.fieldName];

      if (field) {
        vendorData[field] = { key: file.key };
      }
    });

    // Case 4: Create or update vendor record.
    if (!vendorDoc) {
      vendorDoc = await this._vendorInfoRepository.create({
        userId: new Types.ObjectId(vendorId),
        ...vendorData,
      });
    } else {
      vendorDoc.set(vendorData);
      await vendorDoc.save();
    }
    return {
      isProfileVerified: vendorDoc.isProfileVerified,
    };
  }
}
