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
  confirmPayment(gatewayPaymentId: string): Promise<boolean>;
}
