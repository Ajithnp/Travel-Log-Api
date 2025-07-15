
import { FilterQuery } from "mongoose";
import { IOtp } from "../../types/IOtp";

export interface IOtpRepository {
    create(entity:Partial<IOtp>):Promise<IOtp>;
    findOne(query:FilterQuery<IOtp>):Promise<IOtp | null>;
}