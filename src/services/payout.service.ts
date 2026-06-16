import { inject, injectable } from "tsyringe";
import { IPayoutService, PayoutOverviewResponseDto, PayoutScheduleListResponseDto, PayoutStatsResponseDto, ReleasePayoutResponseDTO, FindAllPayoutsResponseDto, SchedulePayoutDetailsResponseDTO, VendorPayoutsListResponseDto } from "../interfaces/service_interfaces/IPayoutService";
import { IPayoutRepository, PayoutFilter } from "../interfaces/repository_interfaces/IPayoutRepository";
import { IPaymentGateway } from "../infrastructure/payment-gateways/IPaymentGateway";
import { IBookingRepository } from "../interfaces/repository_interfaces/IBookingRepository";
import { IVendorInfoRepository } from "../interfaces/repository_interfaces/IVendorInfoRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";
import { HTTP_STATUS } from "../shared/constants/http_status_code";
import { ERROR_MESSAGES } from "../shared/constants/messages";
import { AppError } from "../errors/AppError";
import { USER_ROLES } from "../shared/constants/roles";
import { PAYOUT_STATUS } from "../shared/constants/constants";
import { PaginatedData } from "../types/common/IPaginationResponse";
import { ISchedulePackageRepository } from "../interfaces/repository_interfaces/ISchedulePackage";
import { generatePayoutRefId } from "../shared/utils/generate-booking-code.helper";
import { ICacheService } from "../interfaces/service_interfaces/ICacheService";
import { CACHE_KEYS, CACHE_TTL } from "../types/cache";



@injectable()
export class PayoutService implements IPayoutService {
  constructor(
    @inject('IPayoutRepository')
    private _payoutRepository: IPayoutRepository,
    @inject('IPaymentGateway')
    private _paymentGateway: IPaymentGateway,
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('IVendorInfoRepository')
    private _vendorRepository: IVendorInfoRepository,
    @inject('ISchedulePackageRepository')
    private _scheduleRepository: ISchedulePackageRepository,
    @inject('ICacheService')
    private _cacheService: ICacheService,
  ) { }

  async getPayoutSchedules(page: number, limit: number, search: string): Promise<PaginatedData<PayoutScheduleListResponseDto>> {

    const data = await this._scheduleRepository.getSchedulesForPayout(page, limit, search);

    return {
      data: data.schedules,
      currentPage: page,
      totalPages: Math.ceil(data.total / limit),
      totalDocs: data.total,
    }
  };

  async payoutOverview():Promise<PayoutOverviewResponseDto> {
     const [completedCount, failedCount,processingCount, ] = 
     await Promise.all([
       this._payoutRepository.countDocuments({status:PAYOUT_STATUS.COMPLETED}),
       this._payoutRepository.countDocuments({status:PAYOUT_STATUS.FAILED}),
       this._payoutRepository.countDocuments({status:PAYOUT_STATUS.PROCESSING}),
     ]);
     
     return {completedCount, failedCount,processingCount};
  };
 
  async schedulePayoutDetails(scheduleId: string): Promise<SchedulePayoutDetailsResponseDTO> {
    const cacheKey = CACHE_KEYS.schedulePayoutDetails(scheduleId);

    const cached = await this._cacheService.get<SchedulePayoutDetailsResponseDTO>(cacheKey);
    if (cached) return cached;

    const schedule = await this._scheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const [bookingStats, bookingsData, bookingOverViewStats] = await Promise.all([
      this._bookingRepository.findBookingStatsByScheduleId(scheduleId),
      this._bookingRepository.findAllBookingsByScheduleId(scheduleId),
      this._bookingRepository.payoutOverviewByScheduleId(scheduleId),
    ]);

    if(!bookingStats || !bookingsData ){
      throw new AppError(ERROR_MESSAGES.SCHEDULE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const result: SchedulePayoutDetailsResponseDTO = {
      bookingStats: bookingStats,
      bookingsData: bookingsData,
      bookingOverViewStats: bookingOverViewStats,
    };

    await this._cacheService.set(cacheKey, result, CACHE_TTL.ttl_5_minutes);

    return result;
  };

  async releasePayout(scheduleId: string): Promise<ReleasePayoutResponseDTO> {

    const totals = await this._bookingRepository.findPayableBookingsBySchedule(scheduleId);

    if (!totals || totals.bookingCount === 0) {
      throw new AppError(ERROR_MESSAGES.NO_PAYABLE_BOOKINGS_FOUND, HTTP_STATUS.BAD_REQUEST);
    }

    const { vendorId, grossAmount, commissionAmount, vendorEarnings, totalAmountFromCancelation, bookingIds, bookingCount } = totals;
    const netAmount = vendorEarnings + totalAmountFromCancelation;
    const vendorInfo = await this._vendorRepository.findOne({
      userId: toObjectId(vendorId),
    });

    if (!vendorInfo?.transactionConnect?.payoutsEnabled) {
      throw new AppError(
        ERROR_MESSAGES.VENDOR_PAYOUT_NOT_ENABLED,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payout = await this._payoutRepository.create({
      payoutRefId:generatePayoutRefId(),
      vendorId: toObjectId(vendorId),
      scheduleId: toObjectId(scheduleId),
      bookingIds: bookingIds,
      grossAmount: grossAmount,
      commissionAmount: commissionAmount,
      netAmount: netAmount,
      status: PAYOUT_STATUS.PROCESSING,
      triggeredBy: USER_ROLES.ADMIN,
      scheduledAt: new Date(),
    });
   

    try {
      //  Transfer to vendor via Stripe
      const transferId = await this._paymentGateway.transferToVendor({
        amount: netAmount,
        vendorStripeAccountId: vendorInfo.transactionConnect?.accountId!,
        payoutId: payout._id.toString(),
        vendorId,
      });

    

      await this._payoutRepository.updateStatus(payout._id.toString(), PAYOUT_STATUS.PROCESSING, {
        stripeTransferId: transferId,
      });
  
      return {
        payoutId: payout._id.toString(),
        netAmount,
        transferId,
        bookingCount: bookingCount,
      };
  

    } catch (error) {
      await this._payoutRepository.updateStatus(payout._id.toString(), PAYOUT_STATUS.FAILED, {
        failureReason: (error as Error).message,
      });
      throw new AppError(ERROR_MESSAGES.PAYOUT_FAILED, HTTP_STATUS.BAD_GATEWAY);
    }
  };

  async retryPayout(payoutId: string): Promise<ReleasePayoutResponseDTO> {

  const payout = await this._payoutRepository.findById(payoutId);

  if (!payout) {
    throw new AppError(ERROR_MESSAGES.PAYOUT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (payout.status !== PAYOUT_STATUS.FAILED) {
    throw new AppError(
      `Payout cannot be retried. Current status: ${payout.status}`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const vendorInfo = await this._vendorRepository.findOne({
    userId: payout.vendorId,
  });

  if (!vendorInfo?.transactionConnect?.payoutsEnabled) {
    throw new AppError(
      ERROR_MESSAGES.VENDOR_PAYOUT_NOT_ENABLED,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

 
  await this._payoutRepository.updateStatus(payoutId, PAYOUT_STATUS.PROCESSING, {
    failureReason: null,   
    stripeTransferId: null,
  });

  try {
    // Retry the transfer
    const transferId = await this._paymentGateway.transferToVendor({
      amount: payout.netAmount,
      vendorStripeAccountId: vendorInfo.transactionConnect.accountId!,
      payoutId: payout._id.toString(),
      vendorId: payout.vendorId.toString(),
    });

    await this._payoutRepository.updateStatus(payoutId, PAYOUT_STATUS.PROCESSING, {
      stripeTransferId: transferId,
      triggeredBy: USER_ROLES.ADMIN,
    });

    return {
      payoutId: payout._id.toString(),
      netAmount: payout.netAmount,
      transferId,
      bookingCount: payout.bookingIds.length,
    };

  } catch (error) {
   
    await this._payoutRepository.updateStatus(payoutId, PAYOUT_STATUS.FAILED, {
      failureReason: (error as Error).message,
    });
    throw new AppError(ERROR_MESSAGES.PAYOUT_FAILED, HTTP_STATUS.BAD_GATEWAY);
  }
}

  async payoutStats(): Promise<PayoutStatsResponseDto> {

    const data = await this._payoutRepository.payoutStats();

    return data;
  };

  async findAllPayouts(page: number, limit: number, search?: string, filter?:PayoutFilter): Promise<PaginatedData<FindAllPayoutsResponseDto>> {

    const data = await this._payoutRepository.findAllPayouts(page, limit, search,filter);

    return {
      data: data.payouts,
      currentPage: page,
      totalPages: Math.ceil(data.total / limit),
      totalDocs: data.total,
    }
  };

  async findAllVendorPayouts(vendorId: string, page: number, limit: number, search?: string, filter?: PayoutFilter): Promise<PaginatedData<VendorPayoutsListResponseDto>> {
  const data = await this._payoutRepository.findAllPayoutsByVendor(vendorId, page, limit, search, filter);

  return {
    data: data.payouts,
    currentPage: page,
    totalPages: Math.ceil(data.total / limit),
    totalDocs: data.total,
  }
}



}