import { container } from "tsyringe";
import { IUserRepository } from "../interfaces/repository_interfaces/IUserRepository";
import { UserRepository } from "../repositories/user.repository";
import { IOtpRepository } from "../interfaces/repository_interfaces/IOtpRepository";
import { OtpRepository } from "../repositories/otp.repository";


export class RepositoryRegistry {
    static registerRepositories(): void {
        container.register<IUserRepository>("IUserRepository", {
            useClass: UserRepository,
        });
        container.register<IOtpRepository>("IOtpRepository", {
            useClass: OtpRepository,
        })
        // Register other repositories here
    }
}