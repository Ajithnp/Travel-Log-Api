import { container } from 'tsyringe';
import { IAuthController } from 'interfaces/controller_interfaces/IAuthController';
import { AuthController } from '../controllers/auth/auth.controller';
import { IAdminUserController } from 'interfaces/controller_interfaces/admin/IAdminUserController';
import { AdminUserController } from '../controllers/admin/admin.user.controller';
import { IAdminVendorController } from 'interfaces/controller_interfaces/admin/IAdminVendorController';
import { AdminVendorController } from '../controllers/admin/admin.vendor.controller';

export class ControllerRegistry {
  static registerControllers() {
    container.register<IAuthController>('IAuthController', {
      useClass: AuthController,
    });
    container.register<IAdminUserController>('IAdminUserController', {
      useClass: AdminUserController,
    });
    container.register<IAdminVendorController>('IAdminVendorController', {
      useClass: AdminVendorController,
    });

    // Register other controllers here
  }
}
