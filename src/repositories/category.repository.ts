import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { ICategory } from '../types/entities/category.entity';
import { CategoryModel } from '../models/category.model';
import { ICategoryRepository } from '../interfaces/repository_interfaces/ICategoryRepository';
import mongoose from 'mongoose';
import { CategoryStatus } from 'shared/constants/constants';

@injectable()
export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findByName(name: string): Promise<ICategory | null> {
    return CategoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    }).lean() as Promise<ICategory | null>;
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return CategoryModel.findOne({ slug: slug.toLowerCase() }).lean() as Promise<ICategory | null>;
  }

  async toggleStatus(
    id: string,
    isActive: boolean,
    status: CategoryStatus,
  ): Promise<ICategory | null> {
    return CategoryModel.findByIdAndUpdate(
      id,
      { $set: { isActive, status } },
      { new: true },
    ).lean() as Promise<ICategory | null>;
  }
}
