"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonRegistry = void 0;
const tsyringe_1 = require("tsyringe");
const password_hasher_helper_1 = require("../shared/utils/password.hasher.helper");
const email_transporter_helper_1 = require("../shared/utils/email.transporter.helper");
const StripeGateway_1 = require("../infrastructure/payment-gateways/StripeGateway");
class CommonRegistry {
    static registerCommonDependencies() {
        tsyringe_1.container.register('IBcryptUtils', {
            useClass: password_hasher_helper_1.BcryptUtils,
        });
        tsyringe_1.container.register('IEmailUtils', {
            useClass: email_transporter_helper_1.EmailUtils,
        });
        tsyringe_1.container.register('IPaymentGateway', {
            useClass: StripeGateway_1.StripeGateway,
        });
    }
}
exports.CommonRegistry = CommonRegistry;
