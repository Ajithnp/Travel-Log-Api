import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { inject, injectable } from 'tsyringe';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { IDocuments, IFiles, IVendorInfo } from '../../types/entities/vendor.info.entity';
import { Types } from 'mongoose';
import { IVendorVerificationResponseDTO } from '../../types/dtos/vendor/vendorVerificationResponse.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { USER_ROLES } from '../../shared/constants/roles';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
import { VendorVerificationRequestDTO } from '../../types/dtos/vendor/request.dtos';
import { IFileStorageHandlerService } from '../../interfaces/service_interfaces/IFileStorageBusinessService';
import { UpdateProfileLogoRequestDTO } from '../../validators/vendor/profile.validation';
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
        status: vendorDoc?.status ? vendorDoc.status : VENDOR_VERIFICATION_STATUS.PENDING,
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
      profileLogo: vendorDoc.documents?.profileLogo?.key,
      businessAddress: vendorDoc.businessInfo?.businessAddress,
      contactPersonName: vendorDoc.businessInfo?.contactPersonName,
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

    if (vendorDoc.documents?.profileLogo?.key) {
      await this._fileStorage.deleteFile(vendorDoc.documents?.profileLogo.key);
    }

    const file = payload.files[0];
    // await this._vendorInfoRepository.findByIdAndUpdate(payload.vendorInfoId, {
    //   profileLogo: { key: file.key },
    // });
    await this._vendorInfoRepository.findByIdAndUpdate(payload.vendorInfoId, {
  "documents.profileLogo": {
    key: file.key,
    fieldName: "companyLogo",
  },
});
  }

  async vendorVerificationSubmit(
    vendorId: string,
    verificationData: VendorVerificationRequestDTO,
  ): Promise<IVendorVerificationResponseDTO> {
    let vendorDoc = await this._vendorInfoRepository.findOne({
      userId: new Types.ObjectId(vendorId),
    });

    if (vendorDoc?.status === VENDOR_VERIFICATION_STATUS.APPROVED) {
      throw new AppError(
        ERROR_MESSAGES.VENDOR_VERIFICARION_STATUS_APPROVED,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (vendorDoc?.status === VENDOR_VERIFICATION_STATUS.PENDING) {
      throw new AppError(
        ERROR_MESSAGES.VENDOR_VERIFICATION_STATUS_PENDING,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (vendorDoc && vendorDoc.status === VENDOR_VERIFICATION_STATUS.REJECTED) {
      // remove existing files from s3;
      const oldFiles = [
        vendorDoc.documents?.businessLicence?.key,
        vendorDoc.documents?.businessPan?.key,
        vendorDoc.documents?.profileLogo?.key,
        vendorDoc.documents?.ownerIdentity?.key,
      ].filter(Boolean) as string[];

      if (oldFiles.length > 0) {
        await this._fileStorage.deleteFiles(oldFiles);
      }
    }

    const fileFieldMap: Record<string, keyof IDocuments> = {
      businessLicence: 'businessLicence',
      businessPan: 'businessPan',
      companyLogo: 'profileLogo',
      ownerIdentityProof: 'ownerIdentity',
    };

    const updatedDocuments: Partial<IDocuments> = {};

    verificationData.files.forEach((file) => {
      const field = fileFieldMap[file.fieldName];
      if (field) {
        updatedDocuments[field] = {
          key: file.key,
          fieldName: file.fieldName,
        };
      }
    });

    const vendorData: Partial<IVendorInfo> = {
      userId: new Types.ObjectId(vendorId),
      businessInfo: {
        GSTIN: verificationData.gstin,
        businessAddress: verificationData.businessAddress,
        contactPersonName: verificationData.ownerName,
      },
      bankDetails: {
        accountHolderName: verificationData.accountHolderName,
        accountNumber: verificationData.accountNumber,
        bankName: verificationData.bankName,
        branch: verificationData.branch,
        ifsc: verificationData.ifsc,
      },
      documents: {
        ...vendorDoc?.documents,
        ...updatedDocuments,
      } as IDocuments,

      status: VENDOR_VERIFICATION_STATUS.UNDER_REVIEW,
      reasonForReject: '',
    };

    if (!vendorDoc) {
      vendorDoc = await this._vendorInfoRepository.create(vendorData);
    } else {
      vendorDoc.set(vendorData);
      await vendorDoc.save();
    }
    return {
      isProfileVerified: vendorDoc.isProfileVerified,
    };
  }
}
