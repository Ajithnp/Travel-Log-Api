import { inject, injectable } from 'tsyringe';
import { IAuthController } from 'interfaces/controller_interfaces/IAuthController';
import BaseRoute from '../base.route';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import {
  SignupSchema,
  LoginSchema,
  VerifyEmailSchema,
  ResendOtpSchema,
  GoogleAuthSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  changePasswordSchema,
} from '../../types/dtos/auth/request.dtos';

@injectable()
export class AuthRoutes extends BaseRoute {
  constructor(
    @inject('IAuthController')
    private _authController: IAuthController,
  ) {
    super();
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this._router.post(
      '/login',
      validateDTO(LoginSchema),
      this._authController.loginUser.bind(this._authController),
    );

    this._router.post(
      '/signup',
      validateDTO(SignupSchema),
      this._authController.registerUser.bind(this._authController),
    );

    this._router.post(
      '/verify-email',
      validateDTO(VerifyEmailSchema),
      this._authController.verifyEmail.bind(this._authController),
    );

    this._router.post(
      '/resend-otp',
      validateDTO(ResendOtpSchema),
      this._authController.resendOtp.bind(this._authController),
    );

    this._router.post(
      '/google/callback',
      validateDTO(GoogleAuthSchema),
      this._authController.googleAuthCallback.bind(this._authController),
    );

    this._router.post(
      '/forgot-password',
      validateDTO(ForgotPasswordSchema),
      this._authController.forgotPassword.bind(this._authController),
    );

    this._router.post(
      '/otp-verify',
      validateDTO(VerifyOtpSchema),
      this._authController.verifyOtp.bind(this._authController),
    );

    this._router.post(
      '/change-password',
      validateDTO(changePasswordSchema),
      this._authController.changePassword.bind(this._authController),
    );

    this._router.post(
      '/refresh-token',
      this._authController.refreshAccessToken.bind(this._authController),
    );

    this._router.post('/logout', this._authController.logout.bind(this._authController));
  }
}
