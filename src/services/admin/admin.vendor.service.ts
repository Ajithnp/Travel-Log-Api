import { inject, injectable } from 'tsyringe';
import { PaginatedData } from 'interfaces/common_interfaces/output_types/pagination';
import { IVendorInfo } from 'types/IVendor';
import { IAdminVendorService } from '../../interfaces/service_interfaces/admin/IAdminVendorService';
import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { VENDOR_STATUS } from '../../shared/constants/common';
import { VendorVerificationDTO } from 'validators/vendor.verification.schema';
import { IUser } from '../../types/IUser';
import { IVendorInfoResponseDTO } from '../../dtos/vendor/vendor.info.response.dtos';
import { VendorVerificationUpdateDTO } from '../../dtos/admin/vendor.verification.update.dtos';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { USER_ROLES } from '../../shared/constants/roles';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { FilterQuery, Types } from 'mongoose';
import { blacklistToken } from '../../shared/utils/token.revocation.helper';
import mongoose from 'mongoose';
@injectable()
export class AdminVendorService implements IAdminVendorService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepositorry: IVendorInfoRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
  ) {}

  async vendorVerificationRequestService(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<IVendorInfoResponseDTO>>> {
    const skip = (page - 1) * limit;
    const options = { skip, limit, sort: { createdAt: -1 } };
    const query :FilterQuery<IUser> = { status: VENDOR_STATUS.Pending };

    if (search && search.trim() !== '') {
      query.name = { $regex: search, $options: 'i' };
    }


    const vendorsDoc = await this._vendorInfoRepositorry.findVendorsVerificationDetails(
      query,
      options,
    );

    const totalDocs = await this._vendorInfoRepositorry.getDocsCount(query);

    const vendorData: IVendorInfoResponseDTO[] = vendorsDoc.map((vendor) => {
      const user = vendor.userId as IUser;
      return {
        id: (vendor as IVendorInfo & { _id: string | Types.ObjectId })._id.toString(),
        profileLogo: vendor.profileLogo.url,
        isProfileVerified: vendor.isProfileVerified,
        contactPersonName: vendor.contactPersonName,
        businessAddress: vendor.businessAddress,
        businessLicence: vendor.businessLicence.url,
        ownerIdentity: vendor.ownerIdentity.url,
        GSTIN: vendor.GSTIN,
        status: vendor.status,
        businessPan: vendor.businessPan.url,
        userId: (user as IUser & { _id: string | Types.ObjectId })._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toLocaleDateString(),
      };
    });

    return {
      data: vendorData,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    };
  }

  //=========================verification update=============================
  async updateVendorVerificationService(
    vendorId: string,
    payload: VendorVerificationUpdateDTO,
  ): Promise<void> {
    if (payload.status === VENDOR_STATUS.Rejected && !payload.reasonForReject) {
      throw new AppError(ERROR_MESSAGES.REASON_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    const vendor = await this._vendorInfoRepositorry.findByIdAndUpdate(
      vendorId,
      {
        status: payload.status,
        isProfileVerified: true,
        reasonForReject: payload.status === VENDOR_STATUS.Rejected ? payload.reasonForReject : null,
      },
      { new: true },
    );

    if (!vendor) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
  }
  //================================================================================
  async fetchVendorService(page: number, limit: number): Promise<PaginatedData<Partial<IUser>>> {
    const skip = (page - 1) * limit;
    const query = { role: USER_ROLES.VENDOR };
    const options = { skip, limit };

    const vendorsDoc = await this._userRepository.find(query, options);
    const totalDocs = await this._userRepository.getDocsCount(query);

    const vendorData: Partial<IUser>[] = vendorsDoc.map((user) => ({
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    }));

    return {
      data: vendorData,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    };
  }
  //=========================================================================
  async updateVendorAccessService(
    id: string,
    block: boolean,
    reason?: string,
    accessToken?: string,
  ): Promise<void> {
    const vendorDoc = await this._userRepository.findById(id);

    if (!vendorDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const vendorUpdatedDoc = await this._userRepository.update(id, {
      isBlocked: block,
      blockedReason: block === true ? reason : '',
    });

    if (!vendorUpdatedDoc) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // if (block && accessToken) {
    //   blacklistToken(accessToken);
    // }
  }
}
