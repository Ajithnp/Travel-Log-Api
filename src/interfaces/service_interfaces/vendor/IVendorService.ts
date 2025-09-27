import { VendorVerificationDTO } from 'validators/vendor.verification.schema';
import { IVendorVerificationResponseDTO } from '../../../dtos/vendor/vendorVerificationResponse.dtos';
import mongoose, { Types } from 'mongoose';
import { IVendorProfileResponseDTO } from 'dtos/vendor/vendorProfileResponse.dtos';

export interface IVendorService {

    profileService(id: string): Promise<IVendorProfileResponseDTO>;
    
   vendorVerificationSubmitService(vendorId: string, verificationData: VendorVerificationDTO, files: any): Promise<IVendorVerificationResponseDTO>;
    
    
    
  
}
