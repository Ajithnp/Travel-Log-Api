import { IBaseRepository } from './IBaseRepository';
import { ICategory } from '../../types/entities/category.entity';
import { CategoryStatus } from 'shared/constants/constants';

export interface ICategoryRepository extends IBaseRepository<ICategory> {
  findByName(name: string): Promise<ICategory | null>;
  findBySlug(slug: string, excludeId?: string): Promise<ICategory | null>;
  toggleStatus(id: string, isActive: boolean, status: CategoryStatus): Promise<ICategory | null>;
}
