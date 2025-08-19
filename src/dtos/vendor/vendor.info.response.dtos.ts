export interface IVendorInfoResponseDTO {
  id: string; 

  businessName: string;
  profileLogo: string;
  isProfileVerified: boolean;
  contactPersonName: string;
  contactPersonPhone: string;
  businessAddress: string;
  businessLicence: string;
  GSTIN: string;
  status: "Pending" | "Approved" | "Rejected";
  reasonForReject?: string;
  createdAt: Date;
  updatedAt: Date;

  // Populated User fields
  userId: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isBlocked?: boolean;
    createdAt: Date;
  };
}
