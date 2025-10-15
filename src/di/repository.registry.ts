import { container } from 'tsyringe';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';
import { UserRepository } from '../repositories/user.repository';
import { IVendorInfoRepository } from '../interfaces/repository_interfaces/IVendorInfoRepository';
import { VendorInfoRepository } from '../repositories/vendor.info.repository';

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

    // Register other repositories here
  }
}
