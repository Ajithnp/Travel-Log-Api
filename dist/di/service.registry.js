"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const auth_service_1 = require("../services/auth.service");
const jwt_service_1 = require("../services/jwt.service");
const google_auth_service_1 = require("../services/google.auth.service");
const otp_service_1 = require("../services/otp.service");
const admin_user_service_1 = require("../services/admin/admin.user.service");
const admin_vendor_service_1 = require("../services/admin/admin.vendor.service");
const vendor_service_1 = require("../services/vendor/vendor.service");
const cache_service_1 = require("../services/cache.service");
const user_service_1 = require("../services/user/user.service");
const token_blacklist_service_1 = require("../services/token.blacklist.service");
const s3_service_1 = require("../services/s3.service");
const file_storage_handler_service_1 = require("../services/file.storage.handler.service");
const package_service_1 = require("../services/vendor/package.service");
const category_service_1 = require("../services/admin/category.service");
const category_service_2 = require("../services/vendor/category.service");
const shedule_package_service_1 = require("../services/vendor/shedule.package.service");
const public_package_service_1 = require("../services/user/public-package.service");
const wishlist_service_1 = require("../services/user/wishlist.service");
const public_vendor_service_1 = require("../services/user/public-vendor.service");
const booking_service_1 = require("../services/user/booking.service");
const payment_webhook_service_1 = require("../services/payment-webhook.service");
const cancellation_policy_service_1 = require("../services/admin/cancellation-policy.service");
const vendor_verification_service_1 = require("../services/vendor/vendor-verification.service");
const notification_service_1 = require("../services/notification.service");
const chat_service_1 = require("../services/chat.service");
const wallet_service_1 = require("../services/user/wallet.service");
const document_service_1 = require("../services/document.service");
const admin_vendor_package_service_1 = require("../services/admin/admin-vendor-package.service");
const review_service_1 = require("../services/review.service");
const di_tokens_1 = require("../shared/constants/di.tokens");
const vendor_offer_service_1 = require("../services/vendor/vendor-offer.service");
const coupon_service_1 = require("../services/coupon.service");
const user_reward_service_1 = require("../services/user/user-reward.service");
const admin_finance_service_1 = require("../services/admin/admin.finance.service");
const vendor_revenue_service_1 = require("../services/vendor/vendor-revenue.service");
const stripe_service_1 = require("../services/stripe.service");
const payout_service_1 = require("../services/payout.service");
const admin_service_1 = require("../services/admin/admin.service");
const contact_service_1 = require("../services/contact.service");
class ServiceRegistry {
    static registerServices() {
        tsyringe_1.container.register('IAuthService', {
            useClass: auth_service_1.AuthService,
        });
        tsyringe_1.container.register('ITokenService', {
            useClass: jwt_service_1.TokenService,
        });
        tsyringe_1.container.register('ITokenBlackListService', {
            useClass: token_blacklist_service_1.TokenBlackListService,
        });
        tsyringe_1.container.register('IGoogleService', {
            useClass: google_auth_service_1.GoogleService,
        });
        tsyringe_1.container.register('IOtpService', {
            useClass: otp_service_1.OtpService,
        });
        tsyringe_1.container.register('ICacheService', {
            useClass: cache_service_1.RedisService,
        });
        tsyringe_1.container.register('IStripeService', {
            useClass: stripe_service_1.StripeService,
        });
        tsyringe_1.container.register('IFileStorageService', {
            useClass: s3_service_1.S3Service,
        });
        tsyringe_1.container.register('IPaymentWebhookService', {
            useClass: payment_webhook_service_1.PaymentWebhookService,
        });
        tsyringe_1.container.register('IFileStorageHandlerService', {
            useClass: file_storage_handler_service_1.FileStorageHandlerService,
        });
        tsyringe_1.container.register('INotificationService', {
            useClass: notification_service_1.NotificationService,
        });
        tsyringe_1.container.register('IChatService', {
            useClass: chat_service_1.ChatService,
        });
        tsyringe_1.container.register('IDocumentService', {
            useClass: document_service_1.DocumentService,
        });
        tsyringe_1.container.register('IReviewService', {
            useClass: review_service_1.ReviewService,
        });
        tsyringe_1.container.register('ICouponService', {
            useClass: coupon_service_1.CouponService,
        });
        tsyringe_1.container.register('IPayoutService', {
            useClass: payout_service_1.PayoutService,
        });
        tsyringe_1.container.register('IContactService', {
            useClass: contact_service_1.ContactService,
        });
        //vendor-services
        tsyringe_1.container.register('IVendorService', {
            useClass: vendor_service_1.VendorService,
        });
        tsyringe_1.container.register('IVendorRevenueService', {
            useClass: vendor_revenue_service_1.VendorRevenueService,
        });
        tsyringe_1.container.register('IVendorVerificationService', {
            useClass: vendor_verification_service_1.VendorVerificationService,
        });
        tsyringe_1.container.register('IPackageService', {
            useClass: package_service_1.PackageService,
        });
        tsyringe_1.container.register('IVendorCategoryService', {
            useClass: category_service_2.VendorCategoryService,
        });
        tsyringe_1.container.register('ISchedulePackageService', {
            useClass: shedule_package_service_1.SchedulePackageService,
        });
        //admin-services
        tsyringe_1.container.register('IAdminService', {
            useClass: admin_service_1.AdminService,
        });
        tsyringe_1.container.register('IAdminUserService', {
            useClass: admin_user_service_1.AdminUserService,
        });
        tsyringe_1.container.register('IAdminVendorService', {
            useClass: admin_vendor_service_1.AdminVendorService,
        });
        tsyringe_1.container.register('IAdminCategoryService', {
            useClass: category_service_1.CategoryService,
        });
        tsyringe_1.container.register('ICancellationPolicyService', {
            useClass: cancellation_policy_service_1.CancellationPolicyService,
        });
        tsyringe_1.container.register(di_tokens_1.SERVICE_TOKENS.VENDOR_OFFER_SERVICE, {
            useClass: vendor_offer_service_1.VendorOfferService,
        });
        tsyringe_1.container.register('IAdminVendorPackageOversightService', {
            useClass: admin_vendor_package_service_1.AdminVendorPackageOversightService,
        });
        tsyringe_1.container.register('IAdminFinanceService', {
            useClass: admin_finance_service_1.AdminFinanceService,
        });
        //user services
        tsyringe_1.container.register('IUserService', {
            useClass: user_service_1.UserService,
        });
        tsyringe_1.container.register('IPublicPackageService', {
            useClass: public_package_service_1.PublicPackageService,
        });
        tsyringe_1.container.register('IWishlistService', {
            useClass: wishlist_service_1.WishlistService,
        });
        tsyringe_1.container.register('IPublicVendorService', {
            useClass: public_vendor_service_1.PublicVendorService,
        });
        tsyringe_1.container.register('IBookingService', {
            useClass: booking_service_1.BookingService,
        });
        tsyringe_1.container.register('IWalletService', {
            useClass: wallet_service_1.WalletService,
        });
        tsyringe_1.container.register('IRewardService', {
            useClass: user_reward_service_1.UserRewardService,
        });
    } // Register other services here
}
exports.ServiceRegistry = ServiceRegistry;
