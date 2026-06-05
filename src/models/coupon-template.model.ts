import mongoose, { Schema } from 'mongoose';
import { ICouponTemplate } from '../types/entities/coupon-template.entity';

const CouponTemplateSchema = new Schema<ICouponTemplate>(
  {
    title: {
      type: String,
      required: true,
    },
    rewardValue: {
      type: Number,
      required: true,
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      // 0.1  10% chance to win this specific coupon
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const CouponTemplateModel = mongoose.model<ICouponTemplate>(
  'CouponTemplate',
  CouponTemplateSchema,
);
