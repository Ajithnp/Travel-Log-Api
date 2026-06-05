import { inject, injectable } from 'tsyringe';
import { ICouponController } from '../interfaces/controller_interfaces/ICouponController';
import {
  ICouponService,
  ICreateCouponTemplateRequestDto,
} from '../interfaces/service_interfaces/ICouponService';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { IApiResponse } from '../types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../shared/constants/messages';
import { getPaginationOptions } from '../shared/utils/pagination.helper';
import { IRewardService } from '../interfaces/service_interfaces/user/IRewardService';

@injectable()
export class CouponController implements ICouponController {
  constructor(
    @inject('ICouponService')
    private _couponService: ICouponService,
    @inject('IRewardService')
    private _rewardService: IRewardService,
  ) {}

  createCoupon = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payload: ICreateCouponTemplateRequestDto = req.body;

    const newCoupon = await this._couponService.createCoupon(payload);

    const successResponse: IApiResponse<typeof newCoupon> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.COUPON_CREATED,
      data: newCoupon,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  deActivateCoupon = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const couponId: string = req.params.couponId;

    await this._couponService.deActivateCoupon(couponId);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.COUPON_DEACTIVATED,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getAllCoupons = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search } = getPaginationOptions(req);
    const activeFilter = req.query.isActive as string | undefined;
    const isActive = activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined;

    const coupons = await this._couponService.getAllCoupons(page, limit, search, isActive);

    const successResponse: IApiResponse<typeof coupons> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: coupons,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  getUserReward = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    const reward = await this._rewardService.getUnrevealedReward(userId);

    const successResponse: IApiResponse<typeof reward> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.COUPON_DEACTIVATED,
      data: reward,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  revealReward = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rewardId: string = req.params.rewardId;
    const userId = req.user?.id;

    await this._rewardService.revealReward(rewardId, userId);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
    };
    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
