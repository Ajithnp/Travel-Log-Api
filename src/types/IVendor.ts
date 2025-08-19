import { Document, Types } from 'mongoose';
import { IUser } from './IUser';

type role = 'vendor';

export interface IVendor extends Document {
  userId: Types.ObjectId | IUser;
  businessName: string;
  profileLogo: string;
  isProfileVerified: boolean;
  // role: role;
  contactPersonName: string;
  contactPersonPhone: string;
  businessAddress: string;
  businessLicence: string;
  GSTIN: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reasonForReject?: string;
  pancard: string;
  createdAt: Date;
  updatedAt: Date;
}
