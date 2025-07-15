import { CommonRegistry } from "./common.registry";
import { ControllerRegistry } from "./controller.registry";
import { ServiceRegistry } from "./service.registry";
import { RepositoryRegistry } from "./repository.registry";

export class DependencyInjection {
    static registerDependencies(): void {
        // Register common dependencies
        CommonRegistry.registerCommonDependencies();

        // Register repositories
        RepositoryRegistry.registerRepositories();

        // Register services
        ServiceRegistry.registerServices();

        // Register controllers
        ControllerRegistry.registerControllers();
    }
}