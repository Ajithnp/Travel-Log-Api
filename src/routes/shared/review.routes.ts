import { isAuthenticated, optionalAuth } from '../../middlewares/auth.middleware';
import { IReviewController } from '../../interfaces/controller_interfaces/IReviewController';
import BaseRoute from '../base.route';
import { inject, injectable } from 'tsyringe';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import { createReviewSchema } from '../../validators/review.validation.schema';

@injectable()
export class ReviewRoutes extends BaseRoute {
  constructor(
    @inject('IReviewController')
    private _reviewController: IReviewController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.post(
      '/',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      validateDTO(createReviewSchema),
      this._reviewController.addReview.bind(this._reviewController),
    );

    this._router.delete(
      '/:reviewId',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._reviewController.deleteReview.bind(this._reviewController),
    );

    this._router.get(
      '/public/:packageId',
      optionalAuth,
      this._reviewController.getPackagePublicReviews.bind(this._reviewController),
    );

    this._router.get(
      '/stats/:packageId',
      this._reviewController.getPackageReviewsStats.bind(this._reviewController),
    );
  }
}
