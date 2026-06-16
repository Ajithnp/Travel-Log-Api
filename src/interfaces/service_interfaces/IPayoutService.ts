import { PaginatedData } from "../../types/common/IPaginationResponse";
import { PayoutFilter, VendorPayoutsListResult } from "../../interfaces/repository_interfaces/IPayoutRepository";
import { PayoutStatus } from "../../types/entities/payout.entity";
import { BookingStatsResult, PayoutScheduleOverviewStats, ScheduleBookingsResult } from "../../interfaces/repository_interfaces/IBookingRepository";

export interface IPayoutService {
    getPayoutSchedules(page: number,limit: number,search?: string): Promise<PaginatedData<PayoutScheduleListResponseDto>>;
    payoutOverview():Promise<PayoutOverviewResponseDto>;
    schedulePayoutDetails(scheduleId:string): Promise<SchedulePayoutDetailsResponseDTO>;
    payoutStats(): Promise<PayoutStatsResponseDto>; 
    findAllPayouts(page: number,limit: number,search?: string,filter?:PayoutFilter):Promise<PaginatedData<FindAllPayoutsResponseDto>>   
    releasePayout(scheduleId: string): Promise<ReleasePayoutResponseDTO>
    retryPayout(payoutId: string): Promise<ReleasePayoutResponseDTO>;
    findAllVendorPayouts(vendorId: string, page: number,limit: number,search?: string,filter?:PayoutFilter):Promise<PaginatedData<VendorPayoutsListResponseDto>>   
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
    totalRefundedAmount:number;
    status:string;
    scheduledAt:string;
    payoutsEnabled:boolean;
    transactionConnectId:string;
    readyToPayout:boolean;
    alreadyFailed:boolean;
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

export interface FindAllPayoutsResponseDto {
    id:string;
    scheduleId:string;
    vendorname:string;    
    scheduleStartDate:string;
    scheduleEndDate:string;
    packageTittle:string;
    grossAmount:number;
    commissionAmount:number;
    netAmount:number;
    status:PayoutStatus;
    scheduledAt:Date;
};


export interface SchedulePayoutDetailsResponseDTO {
    bookingsData: ScheduleBookingsResult[];
    bookingStats: BookingStatsResult;
    bookingOverViewStats:PayoutScheduleOverviewStats;
}

export type VendorPayoutsListResponseDto = VendorPayoutsListResult