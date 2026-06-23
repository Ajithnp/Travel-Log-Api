import express from 'express';
import BaseRoute from '../../routes/base.route';
import { inject, injectable } from 'tsyringe';
import { IPaymentWebhookController } from '.../../interfaces/controller_interfaces/IPaymentWebhook';

@injectable()
export class PaymentWebhookRoutes extends BaseRoute {
  constructor(
    @inject('IPaymentWebhookController')
    private _paymentWebhookController: IPaymentWebhookController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.post(
      '/webhook',
      express.raw({ type: 'application/json' }),
      this._paymentWebhookController.confirmPayment.bind(this._paymentWebhookController),
    );
  }
}
