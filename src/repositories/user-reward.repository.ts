import { injectable } from 'tsyringe';
import { IUserRewardRepository } from '../interfaces/repository_interfaces/IUserRewardRepository';
import { BaseRepository } from './base.repository';
import { IUserReward, IUserRewardPopulated } from '../types/entities/user-reward.entity';
import { UserRewardModel } from '../models/user-reward.model';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { USER_REWARD_STATUS } from '../shared/constants/constants';

@injectable()
export class UserRewardRepository
  extends BaseRepository<IUserReward>
  implements IUserRewardRepository
{
  constructor() {
    super(UserRewardModel);
  }

  async findRewardByUserId(userId: string): Promise<IUserRewardPopulated | null> {
    return await this.model
      .findOne({ userId: toObjectId(userId), status: USER_REWARD_STATUS.UNREVEALED })
      .populate('templateId', 'title rewardValue')
      .lean<IUserRewardPopulated>()
      .exec();
  }

  async getRewardAmountByUserId(userId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          userId: toObjectId(userId),
          status: USER_REWARD_STATUS.REVEALED,
        },
      },

      {
        $lookup: {
          from: 'coupontemplates',
          localField: 'templateId',
          foreignField: '_id',
          as: 'templateDetails',
        },
      },

      { $unwind: '$templateDetails' },

      {
        $group: {
          _id: null,
          total: { $sum: '$templateDetails.rewardValue' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}
