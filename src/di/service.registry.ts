import { container } from "tsyringe";
import { IAuthService } from "interfaces/service_interfaces/IAuthService";
import { AuthService } from "../services/auth_service";
import { ITokenService } from "interfaces/service_interfaces/ITokenService";
import { TokenService } from "../services/jwt_service";
import { IGoogleService } from "interfaces/service_interfaces/IGoogleService";
import { GoogleService } from "../services/google_auth_service";
import { IOtpService } from "interfaces/service_interfaces/IOtpService";
import { OtpVerificationService } from "../services/otp.verification.service";

export class ServiceRegistry {
    static registerServices(): void {
        container.register<IAuthService>("IAuthService", {
            useClass: AuthService,
        });
        
        container.register<ITokenService>("ITokenService", {
            useClass:TokenService,
        })

        container.register<IGoogleService>("IGoogleService", {
            useClass:GoogleService,
        })

        container.register<IOtpService>("IOtpService", {
            useClass:OtpVerificationService,
        })
    }    // Register other services here
}        