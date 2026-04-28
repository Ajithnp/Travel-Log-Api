import { container } from 'tsyringe';
import { AuthRoutes } from '../routes/auth/auth.routes';
import { AdminRoutes } from '../routes/admin/admin.routes';
import { VendorRoutes } from '../routes/vendor/vendor.routes';
import { BookingRoutes } from '../routes/user/booking.route';

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
  }
}
