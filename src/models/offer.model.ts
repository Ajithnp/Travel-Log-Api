import { Schema, model } from 'mongoose';
import { IOfferEntity } from '../types/entities/offer.entity';

const offerSchema = new Schema<IOfferEntity>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
      index: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'SchedulePackage',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      required: true,
      default: new Date(),
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const OfferModel = model<IOfferEntity>('Offer', offerSchema);
