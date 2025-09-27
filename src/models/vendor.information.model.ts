import { Schema, model, Types } from 'mongoose';
import { IVendorInfo } from '../types/IVendor';


const vendorSchema = new Schema<IVendorInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
       unique: true,
    },
    isProfileVerified :{
        type: Boolean,
        default: false,
    },
    profileLogo: {
      type: Object,
    },
    ownerIdentity: {
      type: Object,
    },
    contactPersonName: {
      type: String,
    },
    businessAddress: {
      type: String,
    },
    businessLicence: {
      type: Object,
    },
    businessPan: {
      type: Object
    },

    GSTIN: {
      type: String,
    },
    status: {
      type: String,
      enum:['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    reasonForReject: {
      type: String
    },
  },
  { timestamps: true },
);

export const VendorInformationModel = model<IVendorInfo>('vendor', vendorSchema);
