import { Schema, model, Types } from 'mongoose';
import { IVendor } from '../types/IVendor';


const vendorSchema = new Schema<IVendor>(
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
    businessName: {
      type: String,
      required: true,
    },
    profileLogo: {
      type: String,
    },
    // role: {
    //   type: String,
    // },
    contactPersonName: {
      type: String,
    },
    contactPersonPhone: {
      type: String,
    },
    businessAddress: {
      type: String,
    },
    businessLicence: {
      type: String,
    },
    GSTIN: {
      type: String,
    },
    pancard: {
      type: String,
    },
    status: {
      type: String,
      enum:['Pending', 'approved', 'Rejected'],
      default: 'Pending'
    },
    reasonForReject: {
      type: String
    },
  },
  { timestamps: true },
);

export const VendorInformationModel = model<IVendor>('vendor', vendorSchema);
