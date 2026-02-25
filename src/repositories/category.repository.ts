import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ICategory } from '../types/entities/category.entity';
import { CategoryModel } from '../models/category.model';
import { ICategoryRepository } from '../interfaces/repository_interfaces/ICategoryRepository';

@injectable()
export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository{
  constructor() {
    super(CategoryModel);
  }
}
