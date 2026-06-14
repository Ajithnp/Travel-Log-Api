import { injectable, inject } from "tsyringe";
import { IPayoutService, PayoutOverviewResponseDto, PayoutScheduleListResponseDto, ReleasePayoutResponseDTO } from "../interfaces/service_interfaces/IPayoutService";
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



  async releasePayout(scheduleId: string): Promise<ReleasePayoutResponseDTO> {

    const totals = await this._bookingRepository.findPayableBookingsBySchedule(scheduleId);

    if (!totals || totals.bookingCount === 0) {
      throw new AppError(ERROR_MESSAGES.NO_PAYABLE_BOOKINGS_FOUND, HTTP_STATUS.BAD_REQUEST);
    }

    const { vendorId, grossAmount, commissionAmount, netAmount, bookingIds, bookingCount } = totals;

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


}