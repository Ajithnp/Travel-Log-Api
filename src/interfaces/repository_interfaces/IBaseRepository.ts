import { Types } from "mongoose";

export interface IBaseRepository<T> {
 
    create(entity: Partial<T>): Promise<T>;

  
    findById(id: string): Promise<T | null>;


    findOne(query: Partial<T>): Promise<T | null>;

    findOneAndUpdate(query: Partial<T>, filter:Partial<T>, options?:{new:boolean, upsert:boolean}): Promise<T | null>

   
    find(query?: Partial<T>,options?: {skip?: number; limit?: number; sort?: any}): Promise<T[]>;

  
    update(id: string, updates: Partial<T>): Promise<T | null>;

 
    delete(id: string | Types.ObjectId): Promise<T | null>;

    findOneAndDelete(query:Partial<T>):Promise<T | null>
};