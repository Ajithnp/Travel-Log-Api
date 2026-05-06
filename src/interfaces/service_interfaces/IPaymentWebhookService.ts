export interface IPaymentWebhookService {
  handleStripeEvent(rawBody: Buffer, signature: string): Promise<void>;
}
