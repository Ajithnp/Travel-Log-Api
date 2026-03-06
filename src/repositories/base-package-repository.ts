import { injectable } from 'tsyringe';
import { IBasePackageRepository } from '../interfaces/repository_interfaces/IBasePackageRepository';
import { BaseRepository } from './base.repository';
import { IBasePackageEntity, IBasePackagePopulated } from '../types/entities/base-package.entity';
import { PackageModel } from '../models/package.model';
import { FilterType } from 'types/db';
import mongoose from 'mongoose';

@injectable()
export class BasePackageRepository
  extends BaseRepository<IBasePackageEntity>
  implements IBasePackageRepository
{
  constructor() {
    super(PackageModel);
  }

  async findPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<{ requests: IBasePackagePopulated[]; total: number }> {
    const query: mongoose.FilterQuery<IBasePackageEntity> = {
      vendorId,
    };

    if (filters.search?.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ location: { $regex: regex } }, { state: { $regex: regex } }];
    }
    if (filters.selectedFilter?.trim()) {
      query.status = filters.selectedFilter;
    }
    const skip = (filters.page - 1) * filters.limit;

    const [requests, total] = await Promise.all([
      this.model
        .find(query)
        .populate<{ categoryId: { name: string } }>('categoryId', 'name')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(filters.limit)
        .lean<IBasePackagePopulated[]>(),

      this.countDocuments(query),
    ]);

    return { requests, total };
  }
}
