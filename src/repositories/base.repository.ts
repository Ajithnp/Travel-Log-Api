import { IBaseRepository } from 'interfaces/repository_interfaces/IBaseRepository';
import { Model, FilterQuery, Types, UpdateQuery, QueryOptions } from 'mongoose';

export class BaseRepository<T> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findAll(query: FilterQuery<T>, options: QueryOptions<T>): Promise<T[]> {
    const result = await this.model.find(query, null, options).exec();
    return result ?? []; 
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(query).exec(); 
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.exists(filter)
    return !!result;
  };

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    update: Partial<T>,
    options: { new?: boolean; upsert?: boolean } = { new: true },
  ): Promise<T | null> {
    return await this.model.findOneAndUpdate(filter, update, { new: true, ...options }).exec();
  }

  async findByIdAndUpdate(
    id: string,
    update: Partial<T> | UpdateQuery<T>,
    options?: { new?: boolean; upsert?: boolean },
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, update, options).exec();
  }

    async updateAll(filter: any, data: Partial<T>): Promise<number> {
    if (!filter || Object.keys(filter).length === 0) {
      throw new Error(
        'updateAll requires a filter to prevent accidental full updates'
      );
    }

    const result = await this.model.updateMany(filter, data).exec();
    return result.modifiedCount; 
  }

  async findByIdAndDelete(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async findOneAndDelete(query: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(query).exec();
  }
};
