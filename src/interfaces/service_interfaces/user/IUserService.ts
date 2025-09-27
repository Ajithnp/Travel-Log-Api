import { VendorVerificationDTO } from 'validators/vendor.verification.schema';
import { IVendorVerificationResponseDTO } from '../../../dtos/vendor/vendorVerificationResponse.dtos';
import mongoose, { Types } from 'mongoose';
import { IUserProfileDTO } from 'dtos/user/user.profile.response.dtos';

export interface IUserService {

    profileService(id: string): Promise<IUserProfileDTO>;
    
  
}