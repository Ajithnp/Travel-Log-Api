export interface IVendorInfoResponseDTO {
  id: string;
  profileLogo: string;
  isProfileVerified: boolean;
  contactPersonName: string;
  businessAddress: string;
  businessLicence: string;
  ownerIdentity: string;
  businessPan: string;
  GSTIN: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reasonForReject?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}
