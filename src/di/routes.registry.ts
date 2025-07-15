import { container } from "tsyringe";
import { AuthRoutes } from "routes/auth/auth.routes";

export class RoutesRegistry {
    static registerRoutes() {
        container.register(AuthRoutes, {
            useClass: AuthRoutes,   

        })
    }
}