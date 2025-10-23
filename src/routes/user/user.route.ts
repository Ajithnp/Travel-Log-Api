import { inject, injectable } from 'tsyringe';
import { BaseRoute } from '../../routes/base.routes';
import { IUserController } from '../../interfaces/controller_interfaces/user/IUserController';
import { IUserProfileController } from '../../interfaces/controller_interfaces/user/IUserProfileController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
// import { otpLimiter } from '../../config/rate.limiter.config';
// import { makeRateLimiter } from '../../middlewares/rate.limiter.middleware';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import {
  UpdateEmailSchema,
  UpdateEmailRequestSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from '../../types/dtos/user/request.dtos';
@injectable()
export class UserRoutes extends BaseRoute {
  constructor(
    @inject('IUserController')
    private _userController: IUserController,

    @inject('IUserProfileController')
    private _userProfileController: IUserProfileController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.get(
      '/me',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userController.profile.bind(this._userController),
    );

    this._router.put(
      '/me/edit',
      validateDTO(UpdateProfileSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userProfileController.updateProfile.bind(this._userProfileController),
    );

    this._router.post(
      '/me/change-email',
      validateDTO(UpdateEmailRequestSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userProfileController.updateEmailRequest.bind(this._userProfileController),
    );

    this._router.patch(
      '/me/email',
      validateDTO(UpdateEmailSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userProfileController.updateEmail.bind(this._userProfileController),
    );

    this._router.patch(
      '/me/password',
      validateDTO(ResetPasswordSchema),
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      this._userProfileController.resetPassword.bind(this._userProfileController),
    );
  }
}
