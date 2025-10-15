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

export class ControllerRegistry {
  static registerControllers() {
    container.register<IAuthController>('IAuthController', {
      useClass: AuthController,
    });
    //vendor controllers
    container.register<IVendorController>('IVendorController', {
      useClass: VendorController,
    });

    //admin controllers
    container.register<IAdminUserController>('IAdminUserController', {
      useClass: AdminUserController,
    });
    container.register<IAdminVendorController>('IAdminVendorController', {
      useClass: AdminVendorController,
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
