import { inject,injectable } from "tsyringe";
import { IAuthController } from "interfaces/controller_interfaces/IAuthController";
import { BaseRoute } from "../base.routes";
import { isAuthenticated } from "../../middlewares/auth.middleware";

@injectable()
export class AuthRoutes extends BaseRoute {
    constructor(
        @inject("IAuthController")
         private _authController: IAuthController,

    ) {
        super();
        this.initializeRoutes();
    }

     initializeRoutes(): void {

         this._router.post(
            '/login',
             this._authController.login.bind(this._authController)
            );


        this._router.post(
            "/signup",
             this._authController.register.bind(this._authController)
            );

        this._router.post(
            '/verify-email',
            this._authController.verifyEmail.bind(this._authController)
        );

        this._router.post(
            '/resend-otp',
            this._authController.resendOtp.bind(this._authController)
        )
        
        this._router.post(
            '/google/callback',
            this._authController.googleAuthCallback.bind(this._authController)
        );

        this._router.post(
            '/forgot-password',
             this._authController.forgotPasswordRequest.bind(this._authController));
            
        this._router.post(
            '/otp-verify',
            this._authController.verifyOtp.bind(this._authController)
        )     

        this._router.post(
            '/change-password',
            this._authController.changePassword.bind(this._authController)
        )     

        this.router.post(
            '/refresh-token',
            this._authController.refreshAccessToken.bind(this._authController)
        );

        this._router.post(
            '/logout',
             this._authController.logout.bind(this._authController))

    }
    

}