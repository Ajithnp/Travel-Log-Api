import { container } from "tsyringe";
import { AuthRoutes } from "routes/auth/auth.routes";
import { AdminRoutes } from "routes/admin/admin.routes";


export class RoutesRegistry {
    static registerRoutes() {
        container.register(AuthRoutes, {
            useClass: AuthRoutes,   
        });
        container.register(AdminRoutes, {
            useClass: AdminRoutes,
        });
    }
};