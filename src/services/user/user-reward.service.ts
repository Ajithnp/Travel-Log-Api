import { inject, injectable } from 'tsyringe';
import { AppError } from '../../errors/AppError';
import { IUserRewardRepository } from '../../interfaces/repository_interfaces/IUserRewardRepository';
import { IWalletRepository } from '../../interfaces/repository_interfaces/IWalletRepository';
import {
  IRewardService,
  RewardResponseDto,
} from '../../interfaces/service_interfaces/user/IRewardService';
import { USER_REWARD_STATUS } from '../../shared/constants/constants';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { IUserRewardPopulated } from '../../types/entities/user-reward.entity';
import { ICouponRepository } from '../../interfaces/repository_interfaces/ICouponRepository';
import { IWalletTransactionRepository } from '../../interfaces/repository_interfaces/IWalletTransactionRepository';
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '../../shared/constants/wallet';

@injectable()
export class UserRewardService implements IRewardService {
  constructor(
    @inject('IUserRewardRepository')
    private _rewardRepository: IUserRewardRepository,
    @inject('ICouponRepository')
    private _couponRepository: ICouponRepository,
    @inject('IWalletRepository')
    private _walletRepository: IWalletRepository,
    @inject('IWalletTransactionRepository')
    private _walletTransactionRepository: IWalletTransactionRepository,
  ) {}

  private toResponse(reward: IUserRewardPopulated): RewardResponseDto {
    return {
      title: reward.templateId.title,
      rewardValue: reward.templateId.rewardValue,
      id: reward._id.toString(),
    };
  }

  async getUnrevealedReward(userId: string): Promise<RewardResponseDto | null> {
    const reward = await this._rewardRepository.findRewardByUserId(userId);
    return reward ? this.toResponse(reward) : null;
  }

  async revealReward(rewardId: string, userId: string): Promise<void> {
    const reward = await this._rewardRepository.findOne({
      _id: toObjectId(rewardId),
      userId: toObjectId(userId),
    });
    if (!reward) {
      throw new AppError(ERROR_MESSAGES.REWARD_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (reward.status === USER_REWARD_STATUS.REVEALED) {
      throw new AppError(ERROR_MESSAGES.REWARD_ALREADY_USED, HTTP_STATUS.BAD_REQUEST);
    }

    const coupon = await this._couponRepository.findById(reward.templateId.toString());
    if (!coupon) {
      throw new AppError(ERROR_MESSAGES.COUPON_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this._rewardRepository.findOneAndUpdate(
      { _id: toObjectId(rewardId) },
      { status: USER_REWARD_STATUS.REVEALED },
    );

    let wallet = await this._walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      wallet = await this._walletRepository.createWallet(userId);
    }
    if (!wallet) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    this._walletRepository.incrementBalance(userId, coupon.rewardValue);
    this._walletTransactionRepository.createTransaction({
      walletId: wallet._id,
      userId: toObjectId(userId),
      amount: coupon.rewardValue,
      description: 'Reward(cashback) credited',
      type: TRANSACTION_TYPE.CREDIT,
      status: TRANSACTION_STATUS.SUCCESS,
    });
  }
}
