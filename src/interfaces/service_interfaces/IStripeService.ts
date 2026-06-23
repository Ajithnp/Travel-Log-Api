export interface IStripeService {
  createOnboardingLink(userId: string): Promise<{ onboardingUrl: string }>;
  getStripeOnboardingStatus(userId: string): Promise<IStripeOnboardingStatusDTO>;
}

export interface IStripeOnboardingStatusDTO {
  hasStripeAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}
