import { inject, injectable } from 'tsyringe';
import {
  ICouponService,
  ICouponTemplateResponseDto,
  ICreateCouponTemplateRequestDto,
  ICreateCouponTemplateResponseDto,
  PaginatedCouponResponse,
} from '../interfaces/service_interfaces/ICouponService';
import { IUserRewardRepository } from '../interfaces/repository_interfaces/IUserRewardRepository';
import { ICouponRepository } from '../interfaces/repository_interfaces/ICouponRepository';
import { ICouponTemplate } from '../types/entities/coupon-template.entity';
import mongoose from 'mongoose';
import { USER_REWARD_STATUS } from '../shared/constants/constants';
import logger from '../config/logger';
import { AppError } from '../errors/AppError';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { HTTP_STATUS } from '../shared/constants/http_status_code';

@injectable()
export class CouponService implements ICouponService {
  constructor(
    @inject('IUserRewardRepository')
    private _userRewardRepository: IUserRewardRepository,
    @inject('ICouponRepository')
    private _couponRepository: ICouponRepository,
  ) {}

  async createCoupon(
    payload: ICreateCouponTemplateRequestDto,
  ): Promise<ICreateCouponTemplateResponseDto> {
    const existingCoupon = await this._couponRepository.findOne({
      title: payload.title,
      isActive: true,
      rewardValue: payload.rewardValue,
      probability: payload.probability,
    });
    if (existingCoupon) {
      throw new AppError(ERROR_MESSAGES.COUPON_EXIST_WITH_SAME_CRITERIA, HTTP_STATUS.BAD_REQUEST);
    }
    const newCoupon = await this._couponRepository.create({ ...payload });
    return {
      title: newCoupon.title,
      rewardValue: newCoupon.rewardValue,
      probability: newCoupon.probability,
    };
  }

  async deActivateCoupon(couponId: string): Promise<void> {
    const coupon = await this._couponRepository.findById(couponId);
    if (!coupon) {
      throw new AppError(ERROR_MESSAGES.COUPON_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (!coupon.isActive) {
      throw new AppError(ERROR_MESSAGES.COUPON_ALREADY_DEACTIVATED, HTTP_STATUS.BAD_REQUEST);
    }

    await this._couponRepository.findByIdAndUpdate(couponId, { isActive: false });
  }

  async getAllCoupons(
    page: number,
    limit: number,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedCouponResponse> {
    const { data, total } = await this._couponRepository.findAllCoupons(
      page,
      limit,
      search,
      isActive,
    );
    const [activeCount, inactiveCount] = await Promise.all([
      this._couponRepository.countDocuments({ isActive: true }),
      this._couponRepository.countDocuments({ isActive: false }),
    ]);

    const coupons: ICouponTemplateResponseDto[] = data.map((coupon) => ({
      id: coupon._id.toString(),
      title: coupon.title,
      rewardValue: coupon.rewardValue,
      probability: coupon.probability,
      isActive: coupon.isActive,
    }));

    return {
      data: coupons,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
      activeCount,
      inactiveCount,
    };
  }

  async processLuckyDrawCoupons(userId: string): Promise<void> {
    console.log('coupon service reached-------- heyyyy');
    const activeTemplates = await this._couponRepository.findAllActiveCoupons();

    if (activeTemplates.length === 0) return;

    const probabilityValue = Math.random();
    let cumulativeProbability = 0;
    let wonTemplate: ICouponTemplate | null = null;

    for (const template of activeTemplates) {
      cumulativeProbability += template.probability;

      if (probabilityValue <= cumulativeProbability) {
        wonTemplate = template;
        break;
      }
    }

    if (wonTemplate) {
      await this._userRewardRepository.create({
        userId: new mongoose.Types.ObjectId(userId),
        templateId: wonTemplate._id,
        status: USER_REWARD_STATUS.UNREVEALED,
      });

      logger.info(`User ${userId} won reward: ${wonTemplate.title}`);
    } else {
      logger.info(`User ${userId} did not win this time. Better luck next time`);
    }
  }
}
