import { container } from "tsyringe";
import { IAuthService } from "interfaces/service_interfaces/IAuthService";
import { AuthService } from "../services/auth.service";
import { ITokenService } from "interfaces/service_interfaces/ITokenService";
import { TokenService } from "../services/jwt.service";
import { IGoogleService } from "interfaces/service_interfaces/IGoogleService";
import { GoogleService } from "../services/google.auth.service";
import { IOtpService } from "../interfaces/service_interfaces/IOtpService";
import { OtpVerificationService } from "../services/otp.verification.service";
import { IAdminUserService } from "../interfaces/service_interfaces/admin/IAdminUserService";
import { AdminUserService } from "../services/admin/admin.user.service";
import { IAdminVendorService } from "../interfaces/service_interfaces/admin/IAdminVendorService";
import { AdminVendorService } from "../services/admin/admin.vendor.service";

export class ServiceRegistry {
    static registerServices(): void {
        container.register<IAuthService>("IAuthService", {
            useClass: AuthService,
        });
        
        container.register<ITokenService>("ITokenService", {
            useClass:TokenService,
        });

        container.register<IGoogleService>("IGoogleService", {
            useClass:GoogleService,
        });

        container.register<IOtpService>("IOtpService", {
            useClass:OtpVerificationService,
        });

        container.register<IAdminUserService>("IAdminUserService", {
            useClass: AdminUserService,
        });
        container.register<IAdminVendorService>("IAdminVendorService", {
            useClass: AdminVendorService,n
        });
    }    // Register other services here
}        