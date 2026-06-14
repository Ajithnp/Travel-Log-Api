import { injectable } from "tsyringe";
import BaseRoute from "../../routes/base.route";
import { inject } from "tsyringe";
import { IStripeController } from "../../interfaces/controller_interfaces/IPaymentController";
import { CONTROLLER_TOKENS } from "../../shared/constants/di.tokens";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { USER_ROLES } from "../../shared/constants/roles";
import { authorize } from "../../middlewares/aurhorization.middleware";

@injectable()
export class StripeRoutes extends BaseRoute {
  constructor(
    @inject(CONTROLLER_TOKENS.STRIPE_CONTROLLER)
    private _stripeController: IStripeController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.post(
      '/onboard',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._stripeController.initiateStripeOnboarding.bind(this._stripeController),
    );

    this._router.get(
      '/onboard/status',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR]),
      this._stripeController.getStripeOnboardingStatus.bind(this._stripeController),
    );
  }
}