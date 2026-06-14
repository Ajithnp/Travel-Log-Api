import { IPaymentGateway, StripeAccountResponse, StripeTransferResponse } from '../infrastructure/payment-gateways/IPaymentGateway';
import { IPaymentWebhookService } from '../interfaces/service_interfaces/IPaymentWebhookService';
import Stripe from 'stripe';
import { inject, injectable } from 'tsyringe';
import { IBookingService } from '../interfaces/service_interfaces/user/IBookingService';
import { ICouponService } from '../interfaces/service_interfaces/ICouponService';
import { IVendorInfoRepository } from '../interfaces/repository_interfaces/IVendorInfoRepository';
import logger from '../config/logger';
import { IPayoutRepository } from '../interfaces/repository_interfaces/IPayoutRepository';
import { PAYOUT_STATUS } from '../shared/constants/constants';
import { ISchedulePackageRepository } from '../interfaces/repository_interfaces/ISchedulePackage';
type StripeCheckoutSession = Awaited<
  ReturnType<typeof Stripe.prototype.checkout.sessions.retrieve>
>;

@injectable()
export class PaymentWebhookService implements IPaymentWebhookService {
  constructor(
    @inject('IPaymentGateway')
    private _paymentGateway: IPaymentGateway,
    @inject('IBookingService')
    private _bookingService: IBookingService,
    @inject('ICouponService')
    private _couponService: ICouponService,
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IPayoutRepository')
    private _payoutRepository: IPayoutRepository,
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepository: ISchedulePackageRepository,

  ) {}

  async handleStripeEvent(rawBody: Buffer, signature: string): Promise<void> {
    const event = this._paymentGateway.verifyWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSessionCompleted(event.data.object as StripeCheckoutSession);
        this._couponService.processLuckyDrawCoupons(event.data.object.metadata!.userId);
        break;

      case 'checkout.session.expired':
        await this.handleSessionExpired(event.data.object as StripeCheckoutSession);
        break;

      case 'account.updated':                            
        await this.handleAccountUpdated(
          event.data.object as StripeAccountResponse
        );
        break;  

      case 'transfer.created':                           
        await this.handleTransferCreated(
          event.data.object as StripeTransferResponse
        );
        break;  

      default:
        break;
    }
  }

  private async handleSessionCompleted(session: StripeCheckoutSession): Promise<void> {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      return;
    }

    await this._bookingService.confirmBooking({
      userId: session.metadata!.userId,
      bookingId,
      stripePaymentIntentId: session.payment_intent as string,
    });
  }

  private async handleSessionExpired(session: StripeCheckoutSession): Promise<void> {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return;

    await this._bookingService.failedBooking(
      bookingId,
      session.metadata!.userId,
      session.payment_intent as string,
    );
  }

  private async handleAccountUpdated(account: StripeAccountResponse): Promise<void> {
    const vendorId = account.metadata?.vendorId;
    if (vendorId) {
      await this._vendorInfoRepository.updateStripeAccountStatus(
        vendorId,
        account.details_submitted ?? false,
        account.charges_enabled ?? false,
        account.payouts_enabled ?? false
      );
    } else {
      logger.warn(`[Webhook] Account ${account.id} updated but no vendorId found in metadata`);
    }
  }

private async handleTransferCreated(transfer: StripeTransferResponse): Promise<void> {
  const payoutId = transfer.metadata?.payoutId;
  if (!payoutId) {
    logger.warn(`[Webhook] Transfer ${transfer.id} has no payoutId in metadata`);
    return;
  }
  // Mark payout as completed
  await this._payoutRepository.updateStatus(payoutId, PAYOUT_STATUS.COMPLETED, {
    stripeTransferId: transfer.id,
    processedAt: new Date(),
  });
 
  const payout = await this._payoutRepository.findById(payoutId);
 
  if (payout?.scheduleId) {
    await this._schedulePackageRepository.markSchedulePayoutAsCompleted(
      payout.scheduleId.toString(),
      payout._id
    );
  }

  logger.info(`[Webhook] Payout ${payoutId} completed via transfer ${transfer.id}`);
}
}
