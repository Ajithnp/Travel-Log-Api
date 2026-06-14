import { PaginatedData } from "../../types/common/IPaginationResponse";
import { PayoutFilter } from "../../interfaces/repository_interfaces/IPayoutRepository";

export interface IPayoutService {
    getPayoutSchedules(page: number,limit: number,search?: string): Promise<PaginatedData<PayoutScheduleListResponseDto>>;
    payoutOverview():Promise<PayoutOverviewResponseDto>;
    // payoutStats(): Promise<PayoutStatsResponseDto>;    
    releasePayout(scheduleId: string): Promise<ReleasePayoutResponseDTO>
}

export interface ReleasePayoutResponseDTO {
    payoutId: string;
    netAmount: number;
    transferId: string;
    bookingCount: number;
}

export interface PayoutScheduleListResponseDto {
    id:string;
    vendorId:string;
    vendorname:string;    
    scheduleId:string;
    scheduleStartDate:string;
    scheduleEndDate:string;
    packageTittle:string;
    grossAmount:number;
    commissionAmount:number;
    netAmount:number;
    status:string;
    scheduledAt:string;
    payoutsEnabled:boolean;
    transactionConnectId:string;
    readyToPayout:boolean;
}

export interface PayoutStatsResponseDto {
    totalPayouts:number;
    totalReleased:number;
    totalFailed:number;
    totalRevanue:number;
    commissionEarned:number;
    netAmount:number;
}

export interface PayoutOverviewResponseDto {
    completedCount:number;
    failedCount:number;
    processingCount:number;
};