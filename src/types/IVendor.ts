import { Document, Types } from 'mongoose';
import { IUser } from './IUser';



export interface IFiles {
    url: string;
    publicId: string;
}

export interface IVendorInfo extends Document {
  userId: Types.ObjectId | IUser;
  isProfileVerified: boolean;
  contactPersonName: string;
  businessAddress: string;
  businessLicence: IFiles;
  profileLogo: IFiles;
  businessPan: IFiles;
  ownerIdentity: IFiles,
  GSTIN: string;
  status: 'Pending' | 'Approved' | 'Rejected' ;
  reasonForReject?: string;
  createdAt: Date;
  updatedAt: Date;
}

















