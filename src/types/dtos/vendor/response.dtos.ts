import { CategoryStatus } from 'shared/constants/constants';

export interface VendorProfileResponseDTO {
  id: string;
  userId?: string;
  profileLogo: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  businessAddress: string | null;
  contactPersonName: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'NotSubmitted';
  isProfileVerified: boolean;
  reasonForReject: string;
  createdAt: Date;
}

export interface VendorRequestedCategoryResponseDTO {
  id: string;
  name: string;
  adminNote: string | null;
  note: string | null;
  createdAt: string;
  status: CategoryStatus;
}

export interface ActiveCategoriesResponseDTO {
  id: string;
  name: string;
}
