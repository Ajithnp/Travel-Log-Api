import { container } from "tsyringe";
import { IBcryptUtils } from "types/common/IBcryptUtils";
import { BcryptUtils } from "../shared/utils/password.hasher.helper";
import { IEmailUtils } from "types/common/IEmailUtils";
import { EmailUtils } from "../shared/utils/email.transporter.helper";

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