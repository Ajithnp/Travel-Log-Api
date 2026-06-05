import { IUserReward, IUserRewardPopulated } from '../../types/entities/user-reward.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IUserRewardRepository extends IBaseRepository<IUserReward> {
  findRewardByUserId(userId: string): Promise<IUserRewardPopulated | null>;
  getRewardAmountByUserId(userId: string): Promise<number>;
}
