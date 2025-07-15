import { container } from "tsyringe";
import { IBcryptUtils } from "types/common/IBcryptUtils";
import { BcryptUtils } from "../shared/utils/passwordHasher";
import { IEmailUtils } from "types/common/IEmailUtils";
import { EmailUtils } from "../shared/utils/email_transporter";

export class CommonRegistry {
    static registerCommonDependencies() {
        container.register<IBcryptUtils>("IBcryptUtils", {
            useClass: BcryptUtils,
        });

        container.register<IEmailUtils>("IEmailUtils", {
            useClass: EmailUtils
        })

        // Register other common dependencies here
    }
}