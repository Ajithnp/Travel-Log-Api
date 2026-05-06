import Stripe from 'stripe';
import { config } from '../../config/env';
import {
  IPaymentGateway,
  CreatePaymentIntentDTO,
  PaymentIntentResult,
  StripeWebhookEvent,
  StripeCheckoutSession,
} from './IPaymentGateway';
import { injectable } from 'tsyringe';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';

@injectable()
export class StripeGateway implements IPaymentGateway {
  private stripe: InstanceType<typeof Stripe>;

  constructor() {
    this.stripe = new Stripe(config.payment.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    });
  }

  // ── Checkout session ──────

  async createPaymentIntent(data: CreatePaymentIntentDTO): Promise<PaymentIntentResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: data.currency ?? 'inr',
              unit_amount: Math.round(data.amount * 100), // rupees → paise
              product_data: {
                name: data.metadata?.packageName ?? 'Travel Package',
                description: [
                  data.metadata?.tierType ? `Tier: ${data.metadata.tierType}` : null,
                  data.metadata?.seatsCount ? `Seats: ${data.metadata.seatsCount}` : null,
                  data.metadata?.startDate && data.metadata?.endDate
                    ? `Travel: ${data.metadata.startDate} → ${data.metadata.endDate}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' | '),
              },
            },
          },
        ],

        metadata: {
          bookingId: data.bookingId,
          userId: data.metadata?.userId ?? '',
          scheduleId: data.metadata?.scheduleId ?? '',
          tierType: data.metadata?.tierType ?? '',
          seatsCount: data.metadata?.seatsCount ?? '',
          startDate: data.metadata?.startDate ?? '',
          endDate: data.metadata?.endDate ?? '',
          packageName: data.metadata?.packageName ?? '',
        },

        success_url: `${config.cors.ALLOWED_ORIGINS}/booking/confirm?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.cors.ALLOWED_ORIGINS}/payment/cancel?session_id={CHECKOUT_SESSION_ID}&bookingId=${data.bookingId}`,
      });

      if (!session.url) {
        throw new AppError(
          ERROR_MESSAGES.PAYMENT_CONFIRMATION_FAILED,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        gatewayPaymentId: session.id,
        clientSecret: session.client_secret ?? '',
        url: session.url,
      };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new AppError(`Stripe error: ${error.message}`, HTTP_STATUS.BAD_GATEWAY);
      }
      throw error;
    }
  }

  // ── Webhook verification ──

  verifyWebhookEvent(rawBody: Buffer, signature: string): StripeWebhookEvent {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.payment.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new AppError(
        `Webhook signature verification failed: ${(err as Error).message}`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  async verifyStripeSession(stripeSessionId: string): Promise<StripeCheckoutSession> {
    try {
      return await this.stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch (err) {
      throw new AppError(
        `Failed to retrieve Stripe session: ${(err as Error).message}`,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }
  }
}
