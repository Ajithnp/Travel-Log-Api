import Stripe from 'stripe';
import { config } from './env';

export const stripe = new Stripe(config.payment.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
});