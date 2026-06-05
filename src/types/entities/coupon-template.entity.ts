import { Document, Types } from 'mongoose';

export interface ICouponTemplate extends Document {
  _id: Types.ObjectId;
  title: string;
  rewardValue: number;
  probability: number;
  isActive: boolean;
}
