"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const auth_routes_1 = require("../routes/auth/auth.routes");
const admin_routes_1 = require("../routes/admin/admin.routes");
const vendor_routes_1 = require("../routes/vendor/vendor.routes");
const booking_route_1 = require("../routes/user/booking.route");
const payment_webhook_route_1 = require("../routes/shared/payment-webhook.route");
const notification_routes_1 = require("../routes/shared/notification.routes");
const review_routes_1 = require("../routes/shared/review.routes");
const stripe_route_1 = require("../routes/shared/stripe.route");
class RoutesRegistry {
    static registerRoutes() {
        tsyringe_1.container.register(auth_routes_1.AuthRoutes, {
            useClass: auth_routes_1.AuthRoutes,
        });
        tsyringe_1.container.register(booking_route_1.BookingRoutes, {
            useClass: booking_route_1.BookingRoutes,
        });
        tsyringe_1.container.register(admin_routes_1.AdminRoutes, {
            useClass: admin_routes_1.AdminRoutes,
        });
        tsyringe_1.container.register(vendor_routes_1.VendorRoutes, {
            useClass: vendor_routes_1.VendorRoutes,
        });
        tsyringe_1.container.register(payment_webhook_route_1.PaymentWebhookRoutes, {
            useClass: payment_webhook_route_1.PaymentWebhookRoutes,
        });
        tsyringe_1.container.register(notification_routes_1.NotificationRoutes, {
            useClass: notification_routes_1.NotificationRoutes,
        });
        tsyringe_1.container.register(review_routes_1.ReviewRoutes, {
            useClass: review_routes_1.ReviewRoutes,
        });
        tsyringe_1.container.register(stripe_route_1.StripeRoutes, {
            useClass: stripe_route_1.StripeRoutes,
        });
    }
}
exports.RoutesRegistry = RoutesRegistry;
