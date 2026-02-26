import { IBaseRepository } from './IBaseRepository';
import { ICategory } from '../../types/entities/category.entity';

export interface ICategoryRepository extends IBaseRepository<ICategory> {
  findByName(name: string): Promise<ICategory | null>;
  findBySlug(slug: string, excludeId?: string): Promise<ICategory | null>;
}
