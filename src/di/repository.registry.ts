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
export class RepositoryRegistry {
  static registerRepositories(): void {
    container.register<IUserRepository>('IUserRepository', {
      useClass: UserRepository,
    });
    //vendor-repository
    container.register<IVendorInfoRepository>('IvendorInfoRepository', {
      useClass: VendorInfoRepository,
    });
    container.register<IVendorInfoRepository>('IVendorInfoRepository', {
      useClass: VendorInfoRepository,
    });
    container.register<IBasePackageRepository>('IBasePackageRepository', {
      useClass: BasePackageRepository,
    });

    container.register<ISchedulePackageRepository>('ISchedulePackageRepository', {
      useClass: SchedulePackageRepository,
    });
    container.register<ICategoryRepository>('ICategoryRepository', {
      useClass: CategoryRepository,
    });

    // Register other repositories here
  }
}
