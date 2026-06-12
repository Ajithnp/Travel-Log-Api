import { container } from 'tsyringe';
import { IAuthController } from '../interfaces/controller_interfaces/IAuthController';
import { AuthController } from '../controllers/auth/auth.controller';
import { IAdminUserController } from '../interfaces/controller_interfaces/admin/IAdminUserController';
import { AdminUserController } from '../controllers/admin/admin.user.controller';
import { IAdminVendorController } from '../interfaces/controller_interfaces/admin/IAdminVendorController';
import { AdminVendorController } from '../controllers/admin/admin.vendor.controller';
import { IVendorController } from '../interfaces/controller_interfaces/vendor/IVendorController';
import { VendorController } from '../controllers/vendor/vendor.controller';
import { IUserController } from '../interfaces/controller_interfaces/user/IUserController';
import { UserController } from '../controllers/user/user.controller';
import { IUserProfileController } from '../interfaces/controller_interfaces/user/IUserProfileController';
import { UserProfileController } from '../controllers/user/user.profile.controller';
import { IS3Controller } from '../interfaces/controller_interfaces/IS3Controller';
import { S3Controller } from '../controllers/s3.controller';
import { IVendorPackageController } from '../interfaces/controller_interfaces/vendor/IVendorPackageController';
import { VendorPackageController } from '../controllers/vendor/vendor-package.controller';
import { AdminCategoryController } from '../controllers/admin/admin.category.controller';
import { IAdminCategoryController } from '../interfaces/controller_interfaces/admin/IAdminCategoryController';
import { IVendorCategoryController } from '../interfaces/controller_interfaces/vendor/IVendorCategoryController';
import { VendorCategoryController } from '../controllers/vendor/vendor-category.controller';
import { IVendorOfferController } from '../interfaces/controller_interfaces/vendor/IVendorOfferController';
import { VendorOfferController } from '../controllers/vendor/vendor-offer.controller';
import { ISchedulePackageController } from '../interfaces/controller_interfaces/vendor/IShedulePackageController';
import { ShedulePackageController } from '../controllers/vendor/shedule-package-controller';
import { IBookingController } from '../interfaces/controller_interfaces/user/IBookingController';
import { BookingController } from '../controllers/user/booking.controller';
import { IPaymentWebhookController } from '../interfaces/controller_interfaces/IPaymentWebhook';
import { PaymentWebhookController } from '../controllers/payment-webhook.controller';
import { IAdminCancellationPolicyController } from '../interfaces/controller_interfaces/admin/IAdminCancellationPolicyController';
import { AdminCancellationPolicyController } from '../controllers/admin/cancellation-policy.controller';
import { INotificationController } from '../interfaces/controller_interfaces/INotificationController';
import { NotificationController } from '../controllers/notification-controller';
import { IChatController } from '../interfaces/controller_interfaces/IChatController';
import { ChatController } from '../controllers/chat-controller';
import { IWalletController } from '../interfaces/controller_interfaces/user/IWalletController';
import { WalletController } from '../controllers/user/wallet.controller';
import { IDocumentController } from '../interfaces/controller_interfaces/IDocumentController';
import { DocumentController } from '../controllers/document.controller';
import { IAdminVendorPackageOversightController } from '../interfaces/controller_interfaces/admin/IAdminVendorPackageController';
import { AdminVendorPackageOversightController } from '../controllers/admin/admin-vendor-package.controller';
import { IReviewController } from '../interfaces/controller_interfaces/IReviewController';
import { ReviewController } from '../controllers/review.controller';
import { CONTROLLER_TOKENS } from '../shared/constants/di.tokens';
import { ICouponController } from '../interfaces/controller_interfaces/ICouponController';
import { CouponController } from '../controllers/coupon.controller';
import { IAdminFinanceController } from '../interfaces/controller_interfaces/admin/IAdminFinanceController';
import { AdminFinanceController } from '../controllers/admin/admin.finance.controller';
import { IVendorRevenueController } from '../interfaces/controller_interfaces/vendor/IVendorRevenueController';
import { VendorRevenueController } from '../controllers/vendor/vendor-revenue.controller';
import { IStripeController } from '../interfaces/controller_interfaces/IPaymentController';
import { StripeController } from '../controllers/stripe-controller';

export class ControllerRegistry {
  static registerControllers() {
    container.register<IAuthController>('IAuthController', {
      useClass: AuthController,
    });

    container.register<IStripeController>(CONTROLLER_TOKENS.STRIPE_CONTROLLER, {
      useClass: StripeController,
    });

    container.register<IS3Controller>('IS3Controller', {
      useClass: S3Controller,
    });

    container.register<IPaymentWebhookController>('IPaymentWebhookController', {
      useClass: PaymentWebhookController,
    });

    container.register<INotificationController>('INotificationController', {
      useClass: NotificationController,
    });

    container.register<IChatController>('IChatController', {
      useClass: ChatController,
    });

    container.register<IDocumentController>('IDocumentController', {
      useClass: DocumentController,
    });

    container.register<IReviewController>('IReviewController', {
      useClass: ReviewController,
    });

    container.register<ICouponController>('ICouponController', {
      useClass: CouponController,
    });

    container.register<IVendorOfferController>(CONTROLLER_TOKENS.VENDOR_OFFER_CONTROLLER, {
      useClass: VendorOfferController,
    });

    //vendor controllers
    container.register<IVendorController>('IVendorController', {
      useClass: VendorController,
    });
    container.register<IVendorPackageController>('IVendorPackageController', {
      useClass: VendorPackageController,
    });

    container.register<IVendorCategoryController>('IVendorCategoryController', {
      useClass: VendorCategoryController,
    });

    container.register<ISchedulePackageController>('ISchedulePackageController', {
      useClass: ShedulePackageController,
    });

    container.register<IVendorRevenueController>('IVendorRevenueController', {
      useClass: VendorRevenueController,
    });

    //admin controllers
    container.register<IAdminUserController>('IAdminUserController', {
      useClass: AdminUserController,
    });
    container.register<IAdminVendorController>('IAdminVendorController', {
      useClass: AdminVendorController,
    });
    container.register<IAdminCategoryController>('IAdminCategoryController', {
      useClass: AdminCategoryController,
    });
    container.register<IAdminCancellationPolicyController>('IAdminCancellationPolicyController', {
      useClass: AdminCancellationPolicyController,
    });
    container.register<IAdminVendorPackageOversightController>(
      'IAdminVendorPackageOversightController',
      {
        useClass: AdminVendorPackageOversightController,
      },
    );
    container.register<IAdminFinanceController>('IAdminFinanceController', {
      useClass: AdminFinanceController,
    });

    //user controllers
    container.register<IUserController>('IUserController', {
      useClass: UserController,
    });

    container.register<IUserProfileController>('IUserProfileController', {
      useClass: UserProfileController,
    });

    container.register<IBookingController>('IBookingController', {
      useClass: BookingController,
    });

    container.register<IWalletController>('IWalletController', {
      useClass: WalletController,
    });

    // Register other controllers here
  }
}
