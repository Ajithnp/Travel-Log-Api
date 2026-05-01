import { ICancellationPolicy } from "../../types/entities/cancellation-policy.entity";
import { IBaseRepository } from "./IBaseRepository";

export interface ICancellationPolicyRepository extends IBaseRepository<ICancellationPolicy>{
    findByKey(key: string): Promise<ICancellationPolicy | null>;
    toggleActive(id: string, isActive: boolean): Promise<ICancellationPolicy | null>;
 }