
import Stripe from 'stripe';
export type StripeWebhookEvent = ReturnType<typeof Stripe.prototype.webhooks.constructEvent>;
export type StripeCheckoutSession = Awaited<ReturnType<typeof Stripe.prototype.checkout.sessions.retrieve>>;
export interface CreatePaymentIntentDTO {
  amount: number;
  currency: string;
  bookingId: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  gatewayPaymentId: string;
  clientSecret?: string;
   url: string | null;
}

export interface IPaymentGateway {
  createPaymentIntent(data: CreatePaymentIntentDTO): Promise<PaymentIntentResult>;
  verifyWebhookEvent(rawBody: Buffer, signature: string): StripeWebhookEvent;
  verifyStripeSession(stripeSessionId: string): Promise<StripeCheckoutSession>;
}
