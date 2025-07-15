import { Document, Types } from 'mongoose';

type role = 'vendor';

export interface IVendor extends Document {
  userId: Types.ObjectId;
  businessName: string;
  profileLogo: string;
  isProfileVerified: boolean;
  role: role;
  contactPersonName: string;
  contactPersonPhone: string;
  businessAddress: string;
  businessLicence: string;
  GSTIN: string;
  pancard: string;
  createdAt: Date;
  updatedAt: Date;
}
