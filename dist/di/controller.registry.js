"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const auth_controller_1 = require("../controllers/auth/auth.controller");
const admin_user_controller_1 = require("../controllers/admin/admin.user.controller");
const admin_vendor_controller_1 = require("../controllers/admin/admin.vendor.controller");
const vendor_controller_1 = require("../controllers/vendor/vendor.controller");
const user_controller_1 = require("../controllers/user/user.controller");
const user_profile_controller_1 = require("../controllers/user/user.profile.controller");
const s3_controller_1 = require("../controllers/s3.controller");
const vendor_package_controller_1 = require("../controllers/vendor/vendor-package.controller");
const admin_category_controller_1 = require("../controllers/admin/admin.category.controller");
const vendor_category_controller_1 = require("../controllers/vendor/vendor-category.controller");
const vendor_offer_controller_1 = require("../controllers/vendor/vendor-offer.controller");
const shedule_package_controller_1 = require("../controllers/vendor/shedule-package-controller");
const booking_controller_1 = require("../controllers/user/booking.controller");
const payment_webhook_controller_1 = require("../controllers/payment-webhook.controller");
const cancellation_policy_controller_1 = require("../controllers/admin/cancellation-policy.controller");
const notification_controller_1 = require("../controllers/notification-controller");
const chat_controller_1 = require("../controllers/chat-controller");
const wallet_controller_1 = require("../controllers/user/wallet.controller");
const document_controller_1 = require("../controllers/document.controller");
const admin_vendor_package_controller_1 = require("../controllers/admin/admin-vendor-package.controller");
const review_controller_1 = require("../controllers/review.controller");
const di_tokens_1 = require("../shared/constants/di.tokens");
const coupon_controller_1 = require("../controllers/coupon.controller");
const admin_finance_controller_1 = require("../controllers/admin/admin.finance.controller");
const vendor_revenue_controller_1 = require("../controllers/vendor/vendor-revenue.controller");
const stripe_controller_1 = require("../controllers/stripe-controller");
const payout_controller_1 = require("../controllers/payout.controller");
const admin_controller_1 = require("../controllers/admin/admin.controller");
const contact_controller_1 = require("../controllers/contact.controller");
class ControllerRegistry {
    static registerControllers() {
        tsyringe_1.container.register('IAuthController', {
            useClass: auth_controller_1.AuthController,
        });
        tsyringe_1.container.register(di_tokens_1.CONTROLLER_TOKENS.STRIPE_CONTROLLER, {
            useClass: stripe_controller_1.StripeController,
        });
        tsyringe_1.container.register('IS3Controller', {
            useClass: s3_controller_1.S3Controller,
        });
        tsyringe_1.container.register('IPaymentWebhookController', {
            useClass: payment_webhook_controller_1.PaymentWebhookController,
        });
        tsyringe_1.container.register('INotificationController', {
            useClass: notification_controller_1.NotificationController,
        });
        tsyringe_1.container.register('IChatController', {
            useClass: chat_controller_1.ChatController,
        });
        tsyringe_1.container.register('IDocumentController', {
            useClass: document_controller_1.DocumentController,
        });
        tsyringe_1.container.register('IContactController', {
            useClass: contact_controller_1.ContactController,
        });
        tsyringe_1.container.register('IReviewController', {
            useClass: review_controller_1.ReviewController,
        });
        tsyringe_1.container.register('ICouponController', {
            useClass: coupon_controller_1.CouponController,
        });
        tsyringe_1.container.register(di_tokens_1.CONTROLLER_TOKENS.VENDOR_OFFER_CONTROLLER, {
            useClass: vendor_offer_controller_1.VendorOfferController,
        });
        tsyringe_1.container.register(di_tokens_1.CONTROLLER_TOKENS.PAYOUT_CONTROLLER, {
            useClass: payout_controller_1.PayoutController,
        });
        //vendor controllers
        tsyringe_1.container.register('IVendorController', {
            useClass: vendor_controller_1.VendorController,
        });
        tsyringe_1.container.register('IVendorPackageController', {
            useClass: vendor_package_controller_1.VendorPackageController,
        });
        tsyringe_1.container.register('IVendorCategoryController', {
            useClass: vendor_category_controller_1.VendorCategoryController,
        });
        tsyringe_1.container.register('ISchedulePackageController', {
            useClass: shedule_package_controller_1.ShedulePackageController,
        });
        tsyringe_1.container.register('IVendorRevenueController', {
            useClass: vendor_revenue_controller_1.VendorRevenueController,
        });
        //admin controllers
        tsyringe_1.container.register('IAdminController', {
            useClass: admin_controller_1.AdminController,
        });
        tsyringe_1.container.register('IAdminUserController', {
            useClass: admin_user_controller_1.AdminUserController,
        });
        tsyringe_1.container.register('IAdminVendorController', {
            useClass: admin_vendor_controller_1.AdminVendorController,
        });
        tsyringe_1.container.register('IAdminCategoryController', {
            useClass: admin_category_controller_1.AdminCategoryController,
        });
        tsyringe_1.container.register('IAdminCancellationPolicyController', {
            useClass: cancellation_policy_controller_1.AdminCancellationPolicyController,
        });
        tsyringe_1.container.register('IAdminVendorPackageOversightController', {
            useClass: admin_vendor_package_controller_1.AdminVendorPackageOversightController,
        });
        tsyringe_1.container.register('IAdminFinanceController', {
            useClass: admin_finance_controller_1.AdminFinanceController,
        });
        //user controllers
        tsyringe_1.container.register('IUserController', {
            useClass: user_controller_1.UserController,
        });
        tsyringe_1.container.register('IUserProfileController', {
            useClass: user_profile_controller_1.UserProfileController,
        });
        tsyringe_1.container.register('IBookingController', {
            useClass: booking_controller_1.BookingController,
        });
        tsyringe_1.container.register('IWalletController', {
            useClass: wallet_controller_1.WalletController,
        });
        // Register other controllers here
    }
}
exports.ControllerRegistry = ControllerRegistry;
