import { ICouponTemplate } from '../../types/entities/coupon-template.entity';
import { IBaseRepository } from './IBaseRepository';

export interface ICouponRepository extends IBaseRepository<ICouponTemplate> {
  findAllCoupons(
    page: number,
    limit: number,
    search?: string,
    isActive?: boolean,
  ): Promise<{ data: ICouponTemplate[]; total: number }>;
  findAllActiveCoupons(): Promise<ICouponTemplate[]>;
}
