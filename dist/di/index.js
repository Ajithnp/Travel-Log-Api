"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyInjection = void 0;
const common_registry_1 = require("./common.registry");
const controller_registry_1 = require("./controller.registry");
const service_registry_1 = require("./service.registry");
const repository_registry_1 = require("./repository.registry");
class DependencyInjection {
    static registerDependencies() {
        // Register common dependencies
        common_registry_1.CommonRegistry.registerCommonDependencies();
        // Register repositories
        repository_registry_1.RepositoryRegistry.registerRepositories();
        // Register services
        service_registry_1.ServiceRegistry.registerServices();
        // Register controllers
        controller_registry_1.ControllerRegistry.registerControllers();
    }
}
exports.DependencyInjection = DependencyInjection;
