import { Document, Types } from 'mongoose';
import { IUser } from './user.entity';

export interface IFiles {
  key: string;
  fieldName: string;
}

export type VendorStatus = 'Pending' | 'UnderReview' | 'Approved' | 'Rejected' | 'Suspended';

export interface IBusinessInfo {
  contactPersonName: string;
  businessAddress: string;
  GSTIN: string;
}

export interface IDocuments {
  businessLicence: IFiles;
  profileLogo: IFiles;
  businessPan: IFiles;
  ownerIdentity: IFiles;
}

export interface IBankDetails {
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  bankName: string;
  branch: string;
}

export interface IVendorInfo extends Document {
  userId: Types.ObjectId;
  businessInfo: IBusinessInfo;
  documents: IDocuments;
  bankDetails: IBankDetails;
  status: VendorStatus;
  reasonForReject?: string;
  isProfileVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorInfoPopulated extends Omit<IVendorInfo, 'userId'> {
  userId: IUser;
}

export interface IVendorInfoWithUser extends IVendorInfo {
  user: IUser;
}
