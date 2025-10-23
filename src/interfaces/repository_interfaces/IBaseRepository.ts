import { Types, UpdateQuery } from 'mongoose';
import { FilterQuery, QueryOptions } from 'mongoose';

export interface IBaseRepository<T> {
  create(entity: Partial<T>): Promise<T>;

  findAll(query?: Partial<T>, options?: QueryOptions<T>): Promise<T[]>;

  findById(id: string): Promise<T | null>;

  findOne(query: Partial<T>): Promise<T | null>;

  countDocuments(filter?: FilterQuery<T>): Promise<number>;

  findByIdAndUpdate(
    id: string | Types.ObjectId,
    update: Partial<T> | UpdateQuery<T>,
    options?: { new?: boolean; upsert?: boolean },
  ): Promise<T | null>;

  findOneAndUpdate(
    query: Partial<T>,
    filter: Partial<T>,
    options?: { new: boolean; upsert: boolean },
  ): Promise<T | null>;

  findByIdAndUpdate(id: string, updates: Partial<T>): Promise<T | null>;

  exists(filter: FilterQuery<T>): Promise<boolean>;

  findByIdAndDelete(id: string | Types.ObjectId): Promise<T | null>;

  findOneAndDelete(query: Partial<T>): Promise<T | null>;
}
