"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const index_1 = require("./di/index");
const auth_routes_1 = require("./routes/auth/auth.routes");
const admin_routes_1 = require("./routes/admin/admin.routes");
const tsyringe_1 = require("tsyringe");
const cors_middleware_1 = require("./middlewares/cors.middleware");
const error_handler_middleware_1 = require("./middlewares/error.handler.middleware");
const vendor_routes_1 = require("./routes/vendor/vendor.routes");
const user_route_1 = require("./routes/user/user.route");
const booking_route_1 = require("./routes/user/booking.route");
const s3_routes_1 = require("./routes/shared/s3.routes");
const payment_webhook_route_1 = require("./routes/shared/payment-webhook.route");
const notification_routes_1 = require("./routes/shared/notification.routes");
const review_routes_1 = require("./routes/shared/review.routes");
const stripe_route_1 = require("./routes/shared/stripe.route");
class App {
    constructor() {
        this._app = (0, express_1.default)();
        this._port = env_1.config.server.PORT;
        this.initialize();
    }
    initialize() {
        index_1.DependencyInjection.registerDependencies();
        this.configureWebhookRoute();
        this.configureMiddleware();
        this.configureRoutes();
        this._app.use(error_handler_middleware_1.errorMiddleware);
    }
    configureWebhookRoute() {
        this._app.use('/api/v1/payment', tsyringe_1.container.resolve(payment_webhook_route_1.PaymentWebhookRoutes).router);
    }
    //  middleware configurations
    configureMiddleware() {
        this._app.use(express_1.default.json());
        this._app.use((0, cors_1.default)(cors_middleware_1.corsOption));
        this._app.use((0, cookie_parser_1.default)());
        // this._app.use(
        //   morgan('combined', {
        //     stream: {
        //       write: (message) => logger.http(message.trim()),
        //     },
        //   }),
        // );
        this._app.use(express_1.default.urlencoded({ extended: true }));
    }
    configureRoutes() {
        this._app.use('/api/v1/auth', tsyringe_1.container.resolve(auth_routes_1.AuthRoutes).router);
        this._app.use('/api/v1/vendor', tsyringe_1.container.resolve(vendor_routes_1.VendorRoutes).router);
        this._app.use('/api/v1/admin', tsyringe_1.container.resolve(admin_routes_1.AdminRoutes).router);
        this._app.use('/api/v1/user', tsyringe_1.container.resolve(user_route_1.UserRoutes).router);
        this._app.use('/api/v1/stripe', tsyringe_1.container.resolve(stripe_route_1.StripeRoutes).router);
        this._app.use('/api/v1/s3', tsyringe_1.container.resolve(s3_routes_1.S3Routes).router);
        this._app.use('/api/v1/bookings', tsyringe_1.container.resolve(booking_route_1.BookingRoutes).router);
        this._app.use('/api/v1/notifications', tsyringe_1.container.resolve(notification_routes_1.NotificationRoutes).router);
        this._app.use('/api/v1/reviews', tsyringe_1.container.resolve(review_routes_1.ReviewRoutes).router);
    }
    get expressApp() {
        return this._app;
    }
    get port() {
        return this._port;
    }
}
exports.default = App;
