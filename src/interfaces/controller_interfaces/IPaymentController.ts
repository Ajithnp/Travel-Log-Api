import { RequestHandler } from 'express';

export interface IStripeController {
  initiateStripeOnboarding: RequestHandler;
  getStripeOnboardingStatus: RequestHandler;
}
