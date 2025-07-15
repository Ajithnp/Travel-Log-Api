import { IBaseRepository } from "interfaces/repository_interfaces/IBaseRepository";
import { Model, Document, FilterQuery } from "mongoose";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(entity: Partial<T>): Promise<T> {
    return await this.model.create(entity);
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(query).exec();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async find(
    query: FilterQuery<T>,
     options: {skip?: number; limit?: number; sort?: any}
    ):Promise<T[]> {
        return await this.model.find(query, null, options).exec()
    }

    async update(id: string, updates: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, updates, {new: true});
    }

    async delete(id: string): Promise<boolean | null> {
    return await this.model.findByIdAndDelete(id);
  }
}