import Stripe from 'stripe';
export type StripeWebhookEvent = ReturnType<typeof Stripe.prototype.webhooks.constructEvent>;
export type StripeCheckoutSession = Awaited<
  ReturnType<typeof Stripe.prototype.checkout.sessions.retrieve>
>;
export type StripeAccountResponse = Awaited<ReturnType<typeof Stripe.prototype.accounts.retrieve>>;
export type StripeTransferResponse = Awaited<
  ReturnType<typeof Stripe.prototype.transfers.retrieve>
>;

export interface CreatePaymentIntentDTO {
  amount: number;
  currency: string;
  bookingId: string;
  bookingCode: string;
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
  retrieveSession(sessionId: string): Promise<StripeCheckoutSession>;
  createConnectAccount(vendorId: string): Promise<string>;
  createAccountLink(accountId: string): Promise<string>;
  retrieveAccount(accountId: string): Promise<StripeAccountResponse>;
  transferToVendor(transferParams: TransferToVendorParams): Promise<string>;
}

export interface TransferToVendorParams {
  amount: number;
  vendorStripeAccountId: string;
  payoutId: string;
  vendorId: string;
}
