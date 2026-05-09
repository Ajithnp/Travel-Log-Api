import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { inject, injectable } from 'tsyringe';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { Types } from 'mongoose';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { VendorProfileResponseDTO } from '../../types/dtos/vendor/response.dtos';
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
    await this._vendorInfoRepository.findByIdAndUpdate(payload.vendorInfoId, {
      'documents.profileLogo': {
        key: file.key,
        fieldName: 'companyLogo',
      },
    });
  }




}
