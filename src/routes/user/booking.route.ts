import BaseRoute from '../../routes/base.route';
import { inject, injectable } from 'tsyringe';
import { IBookingController } from '../../interfaces/controller_interfaces/user/IBookingController';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { USER_ROLES } from '../../shared/constants/roles';
import { authorize } from '../../middlewares/aurhorization.middleware';
import { validateDTO } from '../../middlewares/validate.dto.middleware';
import { InitiateBookingRequestSchema } from '../../validators/user/booking.validation';


@injectable()
export class BookingRoutes extends BaseRoute {
  constructor(
    @inject('IBookingController')
    private _bookingController: IBookingController,
  ) {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this._router.post(
      '/initiate',
      isAuthenticated,
      authorize([USER_ROLES.USER]),
      validateDTO(InitiateBookingRequestSchema),
      this._bookingController.initiateBooking.bind(this._bookingController),
      );
      
      this._router.get(
        '/verify-payment',
        isAuthenticated,
        authorize([USER_ROLES.USER]),
        this._bookingController.verifyPayment.bind(this._bookingController),
      );
  }
}
