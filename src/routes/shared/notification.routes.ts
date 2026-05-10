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
      isAuthenticated,
      authorize([USER_ROLES.VENDOR, USER_ROLES.USER, USER_ROLES.ADMIN]),
      this._notificationController.getUserNotifications.bind(this._notificationController),
    );

    this._router.get(
      '/unread-count',
      isAuthenticated,
      authorize([USER_ROLES.VENDOR, USER_ROLES.USER, USER_ROLES.ADMIN]),
      this._notificationController.getUnreadCount.bind(this._notificationController),
    );

    this._router.patch(
     "/mark-all-read",
      isAuthenticated,
      authorize([USER_ROLES.VENDOR, USER_ROLES.USER, USER_ROLES.ADMIN]),
      this._notificationController.markAllRead.bind(this._notificationController),
    );

    this._router.patch(
     "/:notificationId/mark-read",
      isAuthenticated,
     authorize([USER_ROLES.VENDOR, USER_ROLES.USER, USER_ROLES.ADMIN]),
      this._notificationController.markAsRead.bind(this._notificationController),
    );

    this._router.delete(
     "/:notificationId",
      isAuthenticated,
      authorize([USER_ROLES.VENDOR, USER_ROLES.USER, USER_ROLES.ADMIN]),
      this._notificationController.deleteNotification.bind(this._notificationController),
    );

  }
}