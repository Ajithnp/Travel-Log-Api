import { RequestHandler } from 'express';

export interface IPaymentWebhookController {
  confirmPayment: RequestHandler;
}
