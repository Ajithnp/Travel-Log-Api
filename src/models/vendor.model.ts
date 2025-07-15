import { Schema, model, Types } from 'mongoose';
import { IVendor } from '../types/IVendor';
import { boolean } from 'zod';
import { ref } from 'process';

const vendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isProfileVerified :{
        type: Boolean
    },
    businessName: {
      type: String,
      required: true,
    },
    profileLogo: {
      type: String,
    },
    role: {
      type: String,
    },
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
  },
  { timestamps: true },
);

export const VendorModel = model<IVendor>('vendor', vendorSchema);
