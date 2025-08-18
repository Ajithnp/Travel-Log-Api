import { VendorVerificationDTO } from 'validators/vendor.verification.schema';
import { IVendorService } from '../../interfaces/service_interfaces/vendor/IVendorService';
import { uploadMultipleToCloudinary } from '../../shared/utils/cloudinary.upload.helper';

export class VendorService implements IVendorService {
  constructor() {}

 async vendorVerificationSubmitService(
    vendorId: string,
    verificationData: VendorVerificationDTO,
    files: any,
  ): Promise<void> {
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
  }
}
