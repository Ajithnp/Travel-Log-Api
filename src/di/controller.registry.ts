import { container } from "tsyringe";
import { IAuthController } from "interfaces/controller_interfaces/IAuthController";
import { AuthController } from "../controllers/auth/auth.controller";
import { IAdminUserController } from "interfaces/controller_interfaces/IAdminUserController";
import { AdminUserController } from "../controllers/admin/admin.user.controller";



export class ControllerRegistry {
    static registerControllers() {
        container.register<IAuthController>("IAuthController", {
            useClass: AuthController,
        });
        container.register<IAdminUserController>("IAdminUserController", {
            useClass: AdminUserController,
        });
        

        // Register other controllers here
    }
}