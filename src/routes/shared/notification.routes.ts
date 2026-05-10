import { isAuthenticated } from "../../middlewares/auth.middleware";
import { INotificationController } from "../../interfaces/controller_interfaces/INotificationController";
import BaseRoute from "../base.route";
import { inject, injectable } from "tsyringe";
import { authorize } from "../../middlewares/aurhorization.middleware";
import { USER_ROLES } from "../../shared/constants/roles";

@injectable()
export class NotificationRoutes extends BaseRoute {
  constructor(
    @inject('INotificationController')
    private _notificationController: INotificationController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.get(
      '/',
    //   isAuthenticated,
    //   authorize([USER_ROLES.VENDOR, USER_ROLES.VENDOR, USER_ROLES.ADMIN]),
      this._notificationController.getUserNotifications.bind(this._notificationController),
    );

    // this._router.patch(
    //   '/me/profileLogo',
    //   validateDTO(UpdateProfileLogoRequestSchema),
    //   isAuthenticated,
    //   authorize([USER_ROLES.VENDOR]),
    //   this._vendorController.updateProfileLogo.bind(this._vendorController),
    // );

    this._router.post(
      '/create',
    //   isAuthenticated,
    //   authorize([USER_ROLES.VENDOR]),
    //   validateDTO(VendorVerificationSchema),
      this._notificationController.createNotification.bind(this._notificationController),
    );
  }
}