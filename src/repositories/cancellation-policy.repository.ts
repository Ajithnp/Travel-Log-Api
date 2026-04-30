import { ICancellationPolicy } from "../types/entities/cancellation-policy.entity";
import { BaseRepository } from "./base.repository";
import { ICancellationPolicyRepository } from "../interfaces/repository_interfaces/ICancellationPolicyRepository";
import { CancellationPolicyModel } from "../models/cancellation-policy.model";
import { injectable } from "tsyringe";

@injectable()
export class CancellationPolicyRepository  extends BaseRepository<ICancellationPolicy> implements ICancellationPolicyRepository { 
   
    constructor() {
         super(CancellationPolicyModel)
    }
    
    async findByKey(key: string): Promise<ICancellationPolicy | null> {
        return this.findOne({ key });
    }
}