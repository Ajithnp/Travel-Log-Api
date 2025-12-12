import { inject, injectable } from 'tsyringe';
import { PaginatedData } from 'types/common/IPaginationResponse';
import { IAdminVendorService } from '../../interfaces/service_interfaces/admin/IAdminVendorService';
import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { IUser } from '../../types/entities/user.entity';
import { IVendorInfo, IVendorInfoWithUser } from '../../types/entities/vendor.info.entity';
import { IVendorInfoResponseDTO } from '../../types/dtos/vendor/vendor.info.response.dtos';
import { VendorVerificationUpdateDTO } from '../../types/dtos/admin/request.dtos';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { FilterQuery, Types } from 'mongoose';
import { CustomQueryOptions } from '../../types/common/IQueryOptions';
import { UserResponseDTO } from '../../types/dtos/admin/response.dtos';
@injectable()
export class AdminVendorService implements IAdminVendorService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
  ) {}

  async vendorVerificationRequests(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<IVendorInfoResponseDTO>>> {
    const skip = (page - 1) * limit;
    const options: CustomQueryOptions = {
      skip,
      limit,
      sort: { createdAt: -1 },
    };

    const userSearchQuery: FilterQuery<IUser> = search
      ? { 'user.name': { $regex: search, $options: 'i' } }
      : {};

    const vendorFilter: FilterQuery<IVendorInfo> = selectedFilter ? { status: selectedFilter } : {};

    const [vendorsDocs, totalDocs] = await Promise.all([
      this._vendorInfoRepository.findVendorsVerificationDetails(
        userSearchQuery,
        vendorFilter,
        options,
      ),
      this._vendorInfoRepository.countVendorDocuments(userSearchQuery, vendorFilter),
    ]);

    const vendorData: IVendorInfoResponseDTO[] = vendorsDocs.map((vendor) => {
      const user = vendor.user as IUser;
      return {
        id: (vendor._id as Types.ObjectId).toString(),
        profileLogo: vendor.profileLogo?.key ?? '',
        isProfileVerified: vendor.isProfileVerified,
        contactPersonName: vendor.contactPersonName,
        businessAddress: vendor.businessAddress,
        businessLicence: vendor.businessLicence?.key ?? '',
        ownerIdentity: vendor.ownerIdentity?.key ?? '',
        GSTIN: vendor.GSTIN,
        status: vendor.status,
        businessPan: vendor.businessPan?.key ?? '',
        userId: (user._id as Types.ObjectId).toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        reasonForReject: vendor.reasonForReject ? vendor.reasonForReject : '',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
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
  async updateVendorVerification(
    vendorId: string,
    payload: VendorVerificationUpdateDTO,
  ): Promise<void> {
    if (payload.status === VENDOR_VERIFICATION_STATUS.REJECTED && !payload.reasonForReject) {
      throw new AppError(ERROR_MESSAGES.REASON_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    const vendor = await this._vendorInfoRepository.findByIdAndUpdate(
      vendorId,
      {
        status: payload.status,
        isProfileVerified: true,
        reasonForReject:
          payload.status === VENDOR_VERIFICATION_STATUS.REJECTED ? payload.reasonForReject : null,
      },
      { new: true },
    );

    if (!vendor) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
  }
  //================================================================================
  async getVendors(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<UserResponseDTO>> {
    const skip = (page - 1) * limit;
    const options: CustomQueryOptions = {
      skip,
      limit,
      sort: { createdAt: -1 },
    };

    const vendorSearchQuery: FilterQuery<IUser> = search
      ? { 'user.name': { $regex: search, $options: 'i' } }
      : {};

    const vendorFilter: FilterQuery<IUser> = {};
    if (selectedFilter === 'active') vendorFilter['user.isBlocked'] = false;
    if (selectedFilter === 'blocked') vendorFilter['user.isBlocked'] = true;

    const matchQuery: FilterQuery<IVendorInfo> = { isProfileVerified: true };

    const [vendorsDocs, totalDocs] = await Promise.all([
      this._vendorInfoRepository.findVendors(vendorSearchQuery, vendorFilter, options),
      this._vendorInfoRepository.countVendorDocuments(vendorSearchQuery, vendorFilter, matchQuery),
    ]);

    const vendorData: UserResponseDTO[] = vendorsDocs.map((vendor) => ({
      id: (vendor.user._id as Types.ObjectId).toString(),
      name: vendor.user.name,
      phone: vendor.user.phone,
      email: vendor.user.email,
      isBlocked: vendor.user.isBlocked,
      createdAt: vendor.user.createdAt.toDateString(),
    }));

    const response = {
      data: vendorData,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    };

    return response;
  }
  //=========================================================================
  async updateVendorAccess(
    id: string,
    block: boolean,
    reason?: string,
    // accessToken?: string,
  ): Promise<void> {
    const vendorDoc = await this._userRepository.findById(id);

    if (!vendorDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const vendorUpdatedDoc = await this._userRepository.findByIdAndUpdate(id, {
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
