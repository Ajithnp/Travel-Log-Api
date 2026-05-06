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

    container.register<IUserRepository>('IUserRepository', {
      useClass: UserRepository,
    });

    container.register<ICancellationPolicyRepository>('ICancellationPolicyRepository', {
      useClass: CancellationPolicyRepository,
    });

    // Register other repositories here
  }
}
