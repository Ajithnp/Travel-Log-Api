
import { FilterQuery, Types } from "mongoose";
import { IOtp } from "../../types/IOtp";

export interface IOtpRepository {
    findOne(query:FilterQuery<IOtp>):Promise<IOtp | null>;
    findOneAndUpdate(query:FilterQuery<IOtp>,filter:Partial<IOtp>, options?: { new?: boolean; upsert?: boolean }): Promise<IOtp | null>;
    delete(id:string | Types.ObjectId):Promise<IOtp | null>
}