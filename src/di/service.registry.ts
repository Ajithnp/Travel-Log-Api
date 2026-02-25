import { container } from 'tsyringe';
import { IAuthService } from 'interfaces/service_interfaces/IAuthService';
import { AuthService } from '../services/auth.service';
import { ITokenService } from 'interfaces/service_interfaces/ITokenService';
import { TokenService } from '../services/jwt.service';
import { IGoogleService } from 'interfaces/service_interfaces/IGoogleService';
import { GoogleService } from '../services/google.auth.service';
import { IOtpService } from '../interfaces/service_interfaces/IOtpService';
import { OtpService } from '../services/otp.service';
import { IAdminUserService } from '../interfaces/service_interfaces/admin/IAdminUserService';
import { AdminUserService } from '../services/admin/admin.user.service';
import { IAdminVendorService } from '../interfaces/service_interfaces/admin/IAdminVendorService';
import { AdminVendorService } from '../services/admin/admin.vendor.service';
import { IVendorService } from '../interfaces/service_interfaces/vendor/IVendorService';
import { VendorService } from '../services/vendor/vendor.service';
import { ICacheService } from '../interfaces/service_interfaces/ICacheService';
import { RedisService } from '../services/cache.service';
import { IUserService } from '../interfaces/service_interfaces/user/IUserService';
import { UserService } from '../services/user/user.service';
import { ITokenBlackListService } from '../interfaces/service_interfaces/ITokenBlacklistService';
import { TokenBlackListService } from '../services/token.blacklist.service';
import { IFileStorageService } from '../interfaces/service_interfaces/IStorageService';
import { S3Service } from '../services/s3.service';
import { IFileStorageHandlerService } from '../interfaces/service_interfaces/IFileStorageBusinessService';
import { FileStorageHandlerService } from '../services/file.storage.handler.service';
import { IPackageService } from '../interfaces/service_interfaces/vendor/IPackageService';
import { PackageService } from '../services/vendor/package.service';
import { IAdminCategoryService } from '../interfaces/service_interfaces/admin/ICategoryService';
import { CategoryService } from '../services/admin/category.service';
export class ServiceRegistry {
  static registerServices(): void {
    container.register<IAuthService>('IAuthService', {
      useClass: AuthService,
    });

    container.register<ITokenService>('ITokenService', {
      useClass: TokenService,
    });

    container.register<ITokenBlackListService>('ITokenBlackListService', {
      useClass: TokenBlackListService,
    });

    container.register<IGoogleService>('IGoogleService', {
      useClass: GoogleService,
    });

    container.register<IOtpService>('IOtpService', {
      useClass: OtpService,
    });

    container.register<ICacheService>('ICacheService', {
      useClass: RedisService,
    });

    container.register<IFileStorageService>('IFileStorageService', {
      useClass: S3Service,
    });

    container.register<IFileStorageHandlerService>('IFileStorageHandlerService', {
      useClass: FileStorageHandlerService,
    });

    //vendor-services
    container.register<IVendorService>('IVendorService', {
      useClass: VendorService,
    });
    container.register<IPackageService>('IPackageService', {
      useClass: PackageService,
    });

    //admin-services
    container.register<IAdminUserService>('IAdminUserService', {
      useClass: AdminUserService,
    });
    container.register<IAdminVendorService>('IAdminVendorService', {
      useClass: AdminVendorService,
    });
    container.register<IAdminCategoryService>('IAdminCategoryService', {
      useClass: CategoryService,
    });

    //user services
    container.register<IUserService>('IUserService', {
      useClass: UserService,
    });
  } // Register other services here
}
