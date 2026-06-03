import mongoose, { Document, Types } from 'mongoose';

export interface IOfferEntity extends Document {
  _id: mongoose.Types.ObjectId;
  vendorId: Types.ObjectId;
  packageId: Types.ObjectId;
  scheduleId: Types.ObjectId | null;
  name: string;
  discountType: 'percentage';
  discountValue: number;
  maxDiscountCap?: number;
  minBookingAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
