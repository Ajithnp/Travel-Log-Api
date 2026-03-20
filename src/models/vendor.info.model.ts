import { Schema, model } from 'mongoose';
import { IVendorInfo } from '../types/entities/vendor.info.entity';

const filesSchema = new Schema<{ key: string; fieldName: string }>(
  {
    key: { type: String, required: true },
    fieldName: { type: String, required: true },
  },
  { _id: false },
);

const businessInfoSchema = new Schema(
  {
    contactPersonName: { type: String, default: null },
    businessAddress: { type: String, default: null },
    GSTIN: { type: String, default: null },
  },
  { _id: false },
);

const documentsSchema = new Schema(
  {
    businessLicence: { type: filesSchema, default: null },
    profileLogo: { type: filesSchema, default: null },
    businessPan: { type: filesSchema, default: null },
    ownerIdentity: { type: filesSchema, default: null },
  },
  { _id: false },
);

const bankDetailsSchema = new Schema(
  {
    accountNumber: { type: String, default: null },
    ifsc: { type: String, default: null },
    accountHolderName: { type: String, default: null },
    bankName: { type: String, default: null },
    branch: { type: String, default: null },
  },
  { _id: false },
);

// ─── Main Schema ─────────────────────────────────────────

const vendorInfoSchema = new Schema<IVendorInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    businessInfo: { type: businessInfoSchema, default: () => ({}) },
    documents: { type: documentsSchema, default: () => ({}) },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },

    status: {
      type: String,
      enum: ['Pending', 'UnderReview', 'Approved', 'Rejected', 'Suspended'],
      default: 'Pending',
    },

    reasonForReject: { type: String, default: null },
    isProfileVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const VendorInformationModel = model<IVendorInfo>('VendorInfo', vendorInfoSchema);
