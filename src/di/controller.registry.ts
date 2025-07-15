import { container } from "tsyringe";
import { IAuthController } from "interfaces/controller_interfaces/IAuthController";
import { AuthController } from "../controllers/auth/auth_controller";

export class ControllerRegistry {
    static registerControllers() {
        container.register<IAuthController>("IAuthController", {
            useClass: AuthController,
        });
        

        // Register other controllers here
    }
}