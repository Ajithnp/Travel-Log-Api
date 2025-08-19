import { Document, Types } from 'mongoose';
import { IUser } from './IUser';

type role = 'vendor';

export interface IFiles {
    url: string;
    publicId: string;
    format: string;
    bytes: number;
}

export interface IVendor extends Document {
  userId: Types.ObjectId | IUser;
  businessName: string;
  isProfileVerified: boolean;
  contactPersonName: string;
  contactPersonPhone: string;
  businessAddress: string;
  businessLicence: IFiles;
  profileLogo: IFiles;
  businessPan: IFiles;
  GSTIN: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reasonForReject?: string;
  createdAt: Date;
  updatedAt: Date;
}
