export interface VendorProfileResponseDTO {
  id: string;
  profileLogo: string | null;
  name: string;
  email: string;
  phone: string;
  businessAddress: string | null;
  contactPersonName: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'NotSubmitted';
  isProfileVerified: boolean;
  reasonForReject: string;
  createdAt: Date;
}
