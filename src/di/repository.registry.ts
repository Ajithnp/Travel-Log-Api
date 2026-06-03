import { container } from 'tsyringe';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';
import { UserRepository } from '../repositories/user.repository';
import { IVendorInfoRepository } from '../interfaces/repository_interfaces/IVendorInfoRepository';
import { VendorInfoRepository } from '../repositories/vendor.info.repository';
import { IBasePackageRepository } from '../interfaces/repository_interfaces/IBasePackageRepository';
import { BasePackageRepository } from '../repositories/base-package-repository';
import { ICategoryRepository } from '../interfaces/repository_interfaces/ICategoryRepository';
import { CategoryRepository } from '../repositories/category.repository';
import { ISchedulePackageRepository } from '../interfaces/repository_interfaces/ISchedulePackage';
import { SchedulePackageRepository } from '../repositories/schedule.package.repository';
import { IWishlistRepository } from '../interfaces/repository_interfaces/IWishlistRepository';
import { WishlistRepository } from '../repositories/wishlist-repository';
import { IBookingRepository } from '../interfaces/repository_interfaces/IBookingRepository';
import { BookingRepository } from '../repositories/booking.repository';
import { ICancellationPolicyRepository } from '../interfaces/repository_interfaces/ICancellationPolicyRepository';
import { CancellationPolicyRepository } from '../repositories/cancellation-policy.repository';
import { INotificationRepository } from '../interfaces/repository_interfaces/INotificationRepository';
import { NotificationRepository } from '../repositories/notification-repository';
import { IChatRepository } from '../interfaces/repository_interfaces/IChatRepository';
import { ChatRepository } from '../repositories/chat.repository';
import { IMessageRepository } from '../interfaces/repository_interfaces/IMessage.repository';
import { MessageRepository } from '../repositories/message.repository';
import { IWalletRepository } from '../interfaces/repository_interfaces/IWalletRepository';
import { WalletRepository } from '../repositories/wallet.repository';
import { IWalletTransactionRepository } from '../interfaces/repository_interfaces/IWalletTransactionRepository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { IReviewRepository } from '../interfaces/repository_interfaces/IReviewRepository';
import { ReviewRepository } from '../repositories/review.repository';
import { REPOSITORY_TOKENS } from '../shared/constants/di.tokens';
import { IOfferRepository } from '../interfaces/repository_interfaces/IOfferRepository';
import { OfferRepository } from '../repositories/offer.repository';

export class RepositoryRegistry {
  static registerRepositories(): void {
    //vendor-repository
    container.register<IVendorInfoRepository>('IvendorInfoRepository', {
      useClass: VendorInfoRepository,
    });
    container.register<IVendorInfoRepository>('IVendorInfoRepository', {
      useClass: VendorInfoRepository,
    });

    container.register<ISchedulePackageRepository>('ISchedulePackageRepository', {
      useClass: SchedulePackageRepository,
    });

    container.register<IBasePackageRepository>('IBasePackageRepository', {
      useClass: BasePackageRepository,
    });

    container.register<ICategoryRepository>('ICategoryRepository', {
      useClass: CategoryRepository,
    });

    container.register<IWishlistRepository>('IWishlistRepository', {
      useClass: WishlistRepository,
    });

    //user-repository

    container.register<IBookingRepository>('IBookingRepository', {
      useClass: BookingRepository,
    });

    container.register<IOfferRepository>(REPOSITORY_TOKENS.OFFER_REPOSITORY, {
      useClass: OfferRepository,
    });

    container.register<IUserRepository>('IUserRepository', {
      useClass: UserRepository,
    });

    container.register<IWalletRepository>('IWalletRepository', {
      useClass: WalletRepository,
    });

    container.register<IWalletTransactionRepository>('IWalletTransactionRepository', {
      useClass: WalletTransactionRepository,
    });

    container.register<ICancellationPolicyRepository>('ICancellationPolicyRepository', {
      useClass: CancellationPolicyRepository,
    });

    // shared repositories

    container.register<INotificationRepository>('INotificationRepository', {
      useClass: NotificationRepository,
    });

    container.register<IChatRepository>('IChatRepository', {
      useClass: ChatRepository,
    });

    container.register<IMessageRepository>('IMessageRepository', {
      useClass: MessageRepository,
    });

    container.register<IReviewRepository>('IReviewRepository', {
      useClass: ReviewRepository,
    });

    // Register other repositories here
  }
}
