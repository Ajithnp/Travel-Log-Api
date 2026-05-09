import { VendorStatus } from 'types/entities/vendor.info.entity';
export interface IVendorInfoResponseDTO {
  id: string;
  profileLogo: string;
  isProfileVerified: boolean;
  contactPersonName: string;
  businessAddress: string;
  bio: string;
  businessLicence: string;
  ownerIdentity: string;
  businessPan: string;
  GSTIN: string;
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  bankName: string;
  branch: string;
  status: VendorStatus;
  reasonForReject?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}
