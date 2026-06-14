import { IBaseRepository } from "./IBaseRepository";
import { IPayout, PayoutStatus } from "../../types/entities/payout.entity";
import { PaginatedData } from "../../types/common/IPaginationResponse";
import { PayoutScheduleListResponseDto } from "../../interfaces/service_interfaces/IPayoutService";

export interface IPayoutRepository extends IBaseRepository<IPayout>{
    
    updateStatus( payoutId: string,status: IPayout['status'],extras?: Partial<IPayout>): Promise<void>;
    getPayoutStats(): Promise<PayoutStatsResult>;
};

export interface PayoutStatsResult {
    totalPayouts: number;
    byStatus: { _id: string; count: number; gross: number; commission: number; net: number }[];
}

export type PayoutFilter = PayoutStatus