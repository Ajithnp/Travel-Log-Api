import mongoose, { Document } from 'mongoose';
import { USER_REWARD_STATUS } from '../../shared/constants/constants';

export type RewardType = (typeof USER_REWARD_STATUS)[keyof typeof USER_REWARD_STATUS];

export interface IUserReward extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  status: RewardType;
}

export interface IPopulatedTemplate {
  _id: mongoose.Types.ObjectId;
  title: string;
  rewardValue: number;
}

export interface IUserRewardPopulated extends Omit<IUserReward, 'templateId'> {
  templateId: IPopulatedTemplate;
}
