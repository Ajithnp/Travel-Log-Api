import { inject, injectable } from 'tsyringe';
import { PaginatedData } from 'interfaces/common_interfaces/output_types/pagination';
import { IVendor } from 'types/IVendor';
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
import { Types } from 'mongoose';
import { blacklistToken } from '../../shared/utils/token.revocation.helper';

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
  ): Promise<PaginatedData<Partial<IVendorInfoResponseDTO>>> {
    const skip = (page - 1) * limit;
    const options = { skip, limit };
    const query = { status: VENDOR_STATUS.Pending };

    const vendorsDoc = await this._vendorInfoRepositorry.find(query, options);
    const totalUsers = await this._vendorInfoRepositorry.getDocsCount(query);

    const vendorData: IVendorInfoResponseDTO[] = vendorsDoc.map((vendor) => {
      const user = vendor.userId as IUser;
      return {
        id: vendor._id.toString(),
        businessName: vendor.businessName,
        profileLogo: vendor.profileLogo,
        isProfileVerified: vendor.isProfileVerified,
        contactPersonName: vendor.contactPersonName,
        contactPersonPhone: vendor.contactPersonPhone,
        businessAddress: vendor.businessAddress,
        businessLicence: vendor.businessLicence,
        GSTIN: vendor.GSTIN,
        status: vendor.status,
        reasonForReject: vendor.reasonForReject,
        pancard: vendor.pancard,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,

        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          isBlocked: user.isBlocked,
          createdAt: user.createdAt,
        },
      };
    });

    return {
        data: vendorData,
        currentPage: page,
        totalPages: Math.ceil(totalUsers/ limit),
        totalUsers
    };
  }

  //=========================verification update=============================
   async updateVendorVerificationService(vendorId: string, payload: VendorVerificationUpdateDTO):Promise<void> {
     
    if (payload.status === VENDOR_STATUS.Rejected && !payload.reasonForReject) {
      throw new AppError(ERROR_MESSAGES.REASON_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    const vendor = await this._vendorInfoRepositorry.findByIdAndUpdate(
        vendorId,
        {status:payload.status, reasonForReject : payload.status === VENDOR_STATUS.Rejected ? payload.reasonForReject : null }, { new: true }

    );

    if (!vendor) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

  };
 //================================================================================
   async fetchVendorService(page: number, limit: number): Promise<PaginatedData<Partial<IUser>>> {
       
        const skip = (page - 1) * limit;
        const query = {role:USER_ROLES.VENDOR};
        const options = {skip,limit};

        const vendorsDoc = await this._userRepository.find(query,options);
        const totalUsers = await this._userRepository.getDocsCount(query);

        const vendorData : Partial<IUser>[] = vendorsDoc.map(user => ({
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email:user.email,
            isBlocked:user.isBlocked,
            createdAt: user.createdAt,
        
            }));

             return {
            data: vendorData, 
            currentPage:page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
        };

   }
   //=========================================================================
   async updateVendorAccessService(id: string, block: boolean, reason?: string, accessToken?: string): Promise<void> {
       
      const vendorDoc = await this._userRepository.findById(id);

      if(!vendorDoc) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS.NOT_FOUND);
        }

        const vendorUpdatedDoc = await this._userRepository.update(id,
            {
                isBlocked:block,
                blockedReason: block === true ? reason : ""
            });

        if(!vendorUpdatedDoc){
            throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,HTTP_STATUS.INTERNAL_SERVER_ERROR);
        };  
        
        if(block && accessToken){
            blacklistToken(accessToken);
        };
   };
};
