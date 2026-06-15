import { IBaseRepository } from "./IBaseRepository";
import { IPayout, PayoutStatus } from "../../types/entities/payout.entity";
import { FindAllPayoutsResponseDto, PayoutStatsResponseDto } from "../../interfaces/service_interfaces/IPayoutService";

export interface IPayoutRepository extends IBaseRepository<IPayout>{
    
    updateStatus( payoutId: string,status: IPayout['status'],extras?: Partial<IPayout>): Promise<void>;
    payoutStats(): Promise<PayoutStatsResponseDto>;
    findAllPayouts(page: number, limit: number, search?: string, filter?: PayoutFilter): Promise<{ payouts: FindAllPayoutsResponseDto[], total: number }>;
};

export type PayoutFilter = PayoutStatus