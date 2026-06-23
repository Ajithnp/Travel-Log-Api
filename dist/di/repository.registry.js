"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const user_repository_1 = require("../repositories/user.repository");
const vendor_info_repository_1 = require("../repositories/vendor.info.repository");
const base_package_repository_1 = require("../repositories/base-package-repository");
const category_repository_1 = require("../repositories/category.repository");
const schedule_package_repository_1 = require("../repositories/schedule.package.repository");
const wishlist_repository_1 = require("../repositories/wishlist-repository");
const booking_repository_1 = require("../repositories/booking.repository");
const cancellation_policy_repository_1 = require("../repositories/cancellation-policy.repository");
const notification_repository_1 = require("../repositories/notification-repository");
const chat_repository_1 = require("../repositories/chat.repository");
const message_repository_1 = require("../repositories/message.repository");
const wallet_repository_1 = require("../repositories/wallet.repository");
const wallet_transaction_repository_1 = require("../repositories/wallet-transaction.repository");
const review_repository_1 = require("../repositories/review.repository");
const di_tokens_1 = require("../shared/constants/di.tokens");
const offer_repository_1 = require("../repositories/offer.repository");
const coupon_repository_1 = require("../repositories/coupon.repository");
const user_reward_repository_1 = require("../repositories/user-reward.repository");
const payout_repository_1 = require("../repositories/payout.repository");
const contact_repository_1 = require("../repositories/contact.repository");
class RepositoryRegistry {
    static registerRepositories() {
        //vendor-repository
        tsyringe_1.container.register('IvendorInfoRepository', {
            useClass: vendor_info_repository_1.VendorInfoRepository,
        });
        tsyringe_1.container.register('IVendorInfoRepository', {
            useClass: vendor_info_repository_1.VendorInfoRepository,
        });
        tsyringe_1.container.register('ISchedulePackageRepository', {
            useClass: schedule_package_repository_1.SchedulePackageRepository,
        });
        tsyringe_1.container.register('IBasePackageRepository', {
            useClass: base_package_repository_1.BasePackageRepository,
        });
        tsyringe_1.container.register('ICategoryRepository', {
            useClass: category_repository_1.CategoryRepository,
        });
        tsyringe_1.container.register('IWishlistRepository', {
            useClass: wishlist_repository_1.WishlistRepository,
        });
        //user-repository
        tsyringe_1.container.register('IBookingRepository', {
            useClass: booking_repository_1.BookingRepository,
        });
        tsyringe_1.container.register(di_tokens_1.REPOSITORY_TOKENS.OFFER_REPOSITORY, {
            useClass: offer_repository_1.OfferRepository,
        });
        tsyringe_1.container.register('IUserRepository', {
            useClass: user_repository_1.UserRepository,
        });
        tsyringe_1.container.register('IWalletRepository', {
            useClass: wallet_repository_1.WalletRepository,
        });
        tsyringe_1.container.register('IWalletTransactionRepository', {
            useClass: wallet_transaction_repository_1.WalletTransactionRepository,
        });
        tsyringe_1.container.register('ICancellationPolicyRepository', {
            useClass: cancellation_policy_repository_1.CancellationPolicyRepository,
        });
        // shared repositories
        tsyringe_1.container.register('INotificationRepository', {
            useClass: notification_repository_1.NotificationRepository,
        });
        tsyringe_1.container.register('IChatRepository', {
            useClass: chat_repository_1.ChatRepository,
        });
        tsyringe_1.container.register('IMessageRepository', {
            useClass: message_repository_1.MessageRepository,
        });
        tsyringe_1.container.register('IReviewRepository', {
            useClass: review_repository_1.ReviewRepository,
        });
        tsyringe_1.container.register('ICouponRepository', {
            useClass: coupon_repository_1.CouponRepository,
        });
        tsyringe_1.container.register('IUserRewardRepository', {
            useClass: user_reward_repository_1.UserRewardRepository,
        });
        tsyringe_1.container.register('IPayoutRepository', {
            useClass: payout_repository_1.PayoutRepository,
        });
        tsyringe_1.container.register('IContactRepository', {
            useClass: contact_repository_1.ContactRepository,
        });
        // Register other repositories here
    }
}
exports.RepositoryRegistry = RepositoryRegistry;
