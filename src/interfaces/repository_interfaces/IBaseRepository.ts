import { Types, UpdateQuery } from "mongoose";
import { FilterQuery, QueryOptions } from "mongoose";

export interface IBaseRepository<T> {
 
    create(entity: Partial<T>): Promise<T>;

  
    findById(id: string): Promise<T | null>;

    getDocsCount(filter?: FilterQuery<T>): Promise<number>

    findOne(query: Partial<T>): Promise<T | null>;

    findByIdAndUpdate(id:string |Types.ObjectId,  update: Partial<T> | UpdateQuery<T>,options?: { new?: boolean; upsert?: boolean }):Promise<T | null>;

    findOneAndUpdate(query: Partial<T>, filter:Partial<T>, options?:{new:boolean, upsert:boolean}): Promise<T | null>

    find(query?: Partial<T>,options?: QueryOptions<T>): Promise<T[]>;

  
    update(id: string, updates: Partial<T>): Promise<T | null>;

 
    delete(id: string | Types.ObjectId): Promise<T | null>;

    findOneAndDelete(query:Partial<T>):Promise<T | null>
};