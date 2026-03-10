import { container } from 'tsyringe';
import { IAuthController } from 'interfaces/controller_interfaces/IAuthController';
import { AuthController } from '../controllers/auth/auth.controller';
import { IAdminUserController } from 'interfaces/controller_interfaces/admin/IAdminUserController';
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
import { ISchedulePackageController } from '../interfaces/controller_interfaces/vendor/IShedulePackageController';
import { ShedulePackageController } from '../controllers/vendor/shedule-package-controller';
export class ControllerRegistry {
  static registerControllers() {
    container.register<IAuthController>('IAuthController', {
      useClass: AuthController,
    });

    container.register<IS3Controller>('IS3Controller', {
      useClass: S3Controller,
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

    //user controllers
    container.register<IUserController>('IUserController', {
      useClass: UserController,
    });

    container.register<IUserProfileController>('IUserProfileController', {
      useClass: UserProfileController,
    });

    // Register other controllers here
  }
}
