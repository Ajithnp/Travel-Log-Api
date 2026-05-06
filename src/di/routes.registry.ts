import { container } from 'tsyringe';
import { AuthRoutes } from '../routes/auth/auth.routes';
import { AdminRoutes } from '../routes/admin/admin.routes';
import { VendorRoutes } from '../routes/vendor/vendor.routes';
import { BookingRoutes } from '../routes/user/booking.route';
import { PaymentWebhookRoutes } from '../routes/shared/payment-webhook.route';
export class RoutesRegistry {
  static registerRoutes() {
    container.register(AuthRoutes, {
      useClass: AuthRoutes,
    });
    container.register(BookingRoutes, {
      useClass: BookingRoutes,
    });

    container.register(AdminRoutes, {
      useClass: AdminRoutes,
    });
    container.register(VendorRoutes, {
      useClass: VendorRoutes,
    });
    container.register(PaymentWebhookRoutes, {
      useClass: PaymentWebhookRoutes,
    });
  }
}
