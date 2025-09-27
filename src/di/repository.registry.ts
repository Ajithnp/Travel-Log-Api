import { container } from "tsyringe";
import { IUserRepository } from "../interfaces/repository_interfaces/IUserRepository";
import { UserRepository } from "../repositories/user.repository";
import { IOtpRepository } from "../interfaces/repository_interfaces/IOtpRepository";
import { OtpRepository } from "../repositories/otp.repository";
import { IVendorInfoRepository } from "../interfaces/repository_interfaces/IVendorInfoRepository";
import { VendorInfoRepository } from "../repositories/vendor.info.repository";

export class RepositoryRegistry {
    static registerRepositories(): void {
        container.register<IUserRepository>("IUserRepository", {
            useClass: UserRepository,
        });
        //vendor-repository
        container.register<IVendorInfoRepository>("IvendorInfoRepository", {
            useClass: VendorInfoRepository
        })
        container.register<IOtpRepository>("IOtpRepository", {
            useClass: OtpRepository,
        });
        container.register<IVendorInfoRepository>("IVendorInfoRepository", {
            useClass: VendorInfoRepository,
        });

        // Register other repositories here
    }
}