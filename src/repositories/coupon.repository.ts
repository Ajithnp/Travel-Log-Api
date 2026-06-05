import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ICouponRepository } from '../interfaces/repository_interfaces/ICouponRepository';
import { ICouponTemplate } from '../types/entities/coupon-template.entity';
import { CouponTemplateModel } from '../models/coupon-template.model';
import { FilterQuery } from 'mongoose';

@injectable()
export class CouponRepository extends BaseRepository<ICouponTemplate> implements ICouponRepository {
  constructor() {
    super(CouponTemplateModel);
  }

  async findAllActiveCoupons(): Promise<ICouponTemplate[]> {
    return await this.model.find({ isActive: true });
  }

  async findAllCoupons(
    page: number,
    limit: number,
    search?: string,
    isActive?: boolean,
  ): Promise<{ data: ICouponTemplate[]; total: number }> {
    const query: FilterQuery<ICouponTemplate> = {};
    const skip = (page - 1) * limit;

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(query),
    ]);

    return { data, total };
  }
}
