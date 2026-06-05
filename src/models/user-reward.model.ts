import mongoose, { Schema } from 'mongoose';
import { IUserReward } from '../types/entities/user-reward.entity';

const UserRewardSchema = new Schema<IUserReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'CouponTemplate',
      required: true,
    },

    status: {
      type: String,
      enum: ['UNREVEALED', 'REVEALED', 'USED', 'EXPIRED'],
      default: 'UNREVEALED',
    },
  },
  { timestamps: true },
);

export const UserRewardModel = mongoose.model<IUserReward>('UserReward', UserRewardSchema);
