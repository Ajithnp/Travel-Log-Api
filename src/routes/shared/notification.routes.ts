import { INotificationController } from "../../interfaces/controller_interfaces/INotificationController";
import BaseRoute from "../base.route";
import { inject, injectable } from "tsyringe";

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
    // this._router.get(
    //   '/me',
    //   isAuthenticated,
    //   authorize([USER_ROLES.VENDOR]),
    //   this._vendorController.profile.bind(this._vendorController),
    // );

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