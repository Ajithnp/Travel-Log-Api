import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import {inject, injectable} from 'tsyringe'
import { VendorVerificationDTO } from 'validators/vendor.verification.schema';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { uploadMultipleToCloudinary } from '../../shared/utils/cloudinary.upload.helper';
import { IVendor } from 'types/IVendor';
import { Types } from 'mongoose';
import { IVendorVerificationResponseDTO } from '../../dtos/vendor/vendor.verification.response.dtos';



@injectable()
export class VendorService implements IVendorService {
  constructor(
    @inject('IVendorRepository')
    private _vendorInfoRepository : IVendorInfoRepository,
  ) {}

 async vendorVerificationSubmitService(
    vendorId: string,
    verificationData: VendorVerificationDTO,
    files: any,
  ): Promise<IVendorVerificationResponseDTO> {
    // Upload all files to Cloudinary
    
        const uploadedDocs = await uploadMultipleToCloudinary(
      {
        businessLicence: files.businessLicence?.[0],
        businessPan: files.businessPan?.[0],
        companyLogo: files.companyLogo?.[0],
      },
      vendorId,
      'vendor'
      );

       const vendorData: Partial<IVendor> = {
        userId: new Types.ObjectId(vendorId), 
        GSTIN: verificationData.gstin,
        businessAddress: verificationData.address,
        contactPersonName: verificationData.ownerName,
        // Map the Cloudinary results to the database fields
        businessLicence: uploadedDocs.businessLicence,
        businessPan: uploadedDocs.businessPan,
        profileLogo: uploadedDocs.companyLogo,
      };

       const newVendorDocs = await this._vendorInfoRepository.create(
        vendorData
      )

      return {
        isProfileVerified: newVendorDocs.isProfileVerified
      }

  }
}
