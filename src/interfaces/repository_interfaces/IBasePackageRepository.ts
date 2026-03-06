import { FilterType } from 'types/db';
import {
  IBasePackageEntity,
  IBasePackagePopulated,
} from '../../types/entities/base-package.entity';
import { IBaseRepository } from './IBaseRepository';

export interface IBasePackageRepository extends IBaseRepository<IBasePackageEntity> {
  findPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<{ requests: IBasePackagePopulated[]; total: number }>;
}
