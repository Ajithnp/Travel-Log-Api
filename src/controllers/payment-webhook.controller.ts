import expressAsyncHandler from 'express-async-handler';
import { IPaymentWebhookController } from '../interfaces/controller_interfaces/IPaymentWebhook';
import { IPaymentWebhookService } from '../interfaces/service_interfaces/IPaymentWebhookService';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { inject, injectable } from 'tsyringe';

@injectable()
export class PaymentWebhookController implements IPaymentWebhookController {
  constructor(
    @inject('IPaymentWebhookService')
    private _paymentWebhookService: IPaymentWebhookService,
  ) {}

  confirmPayment = expressAsyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const rawBody = req.body as Buffer;

    await this._paymentWebhookService.handleStripeEvent(rawBody, sig);

    res.status(HTTP_STATUS.CREATED).json({ received: true });
  });
}
