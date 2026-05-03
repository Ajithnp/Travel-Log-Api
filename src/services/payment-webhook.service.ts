import { IPaymentGateway } from "../infrastructure/payment-gateways/IPaymentGateway";
import { IPaymentWebhookService } from "../interfaces/service_interfaces/IPaymentWebhookService";
import Stripe from "stripe";
import { inject, injectable } from "tsyringe";
import {IBookingService} from "../interfaces/service_interfaces/user/IBookingService";

type StripeCheckoutSession = Awaited<ReturnType<typeof Stripe.prototype.checkout.sessions.retrieve>>;

@injectable()
export class PaymentWebhookService implements IPaymentWebhookService {
    constructor(
        @inject('IPaymentGateway')
        private _paymentGateway: IPaymentGateway,
        @inject('IBookingService')
        private _bookingService: IBookingService
    ) { }

  async handleStripeEvent(rawBody: Buffer, signature: string): Promise<void> { 
      
    const event = this._paymentGateway.verifyWebhookEvent(rawBody, signature);
       
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSessionCompleted(
          event.data.object as StripeCheckoutSession,
        );
        break;

      case 'checkout.session.expired':
        await this.handleSessionExpired(
          event.data.object as StripeCheckoutSession,
        );
        
        break;
      default:
        break;
    }
  
    }

  private async handleSessionCompleted(
    session: StripeCheckoutSession,
  ): Promise<void> {
    
    const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
    return;
  }
 
  try {
    await this._bookingService.confirmBooking({
      userId: session.metadata!.userId,
      bookingId,
      stripePaymentIntentId: session.payment_intent as string,
    });

  } catch (err) {
    throw err;
  }
  }
  
    private async handleSessionExpired(
    session: StripeCheckoutSession,
  ): Promise<void> {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return;

    await this._bookingService.confirmBooking({
      userId: session.metadata!.userId,
      bookingId: bookingId,
      stripePaymentIntentId: session.payment_intent as string,
    });
  }
    
}