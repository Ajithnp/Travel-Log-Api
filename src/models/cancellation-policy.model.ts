import mongoose, { Document, Schema } from 'mongoose';
import { ICancellationPolicy, ICancellationRule } from '../types/entities/cancellation-policy.entity';

const CancellationRuleSchema = new Schema<ICancellationRule>(
  {
    daysBeforeTrip: {
      type: Number,
      required: true,
      min: 0,
    },
    refundPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);
 
const CancellationPolicySchema = new Schema<ICancellationPolicy>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]+$/,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rules: {
      type: [CancellationRuleSchema],
      required: true,
      validate: {
        validator: (rules: ICancellationRule[]) => rules.length >= 1,
        message: 'At least one rule is required.',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CancellationPolicySchema.index({ isActive: 1 });
CancellationPolicySchema.index({ key: 1, isActive: 1 });
 
export const CancellationPolicyModel = mongoose.model<ICancellationPolicy>(
  'CancellationPolicy',
  CancellationPolicySchema
);