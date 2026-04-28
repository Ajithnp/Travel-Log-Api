import Stripe from 'stripe';
import { IPaymentGateway, CreatePaymentIntentDTO, PaymentIntentResult } from './IPaymentGateway';
import { injectable } from 'tsyringe';

@injectable()
export class StripeGateway implements IPaymentGateway {
  private stripe: InstanceType<typeof Stripe>;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createPaymentIntent(data: CreatePaymentIntentDTO): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency ?? 'inr',
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId: data.bookingId, ...data.metadata },
    });
    return {
      gatewayPaymentId: intent.id,
      clientSecret: intent.client_secret!,
      status: 'created',
    };
  }

  async confirmPayment(gatewayPaymentId: string): Promise<boolean> {
    const intent = await this.stripe.paymentIntents.retrieve(gatewayPaymentId);
    return intent.status === 'succeeded';
  }
}
