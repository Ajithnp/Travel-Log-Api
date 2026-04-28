import { container } from 'tsyringe';
import { IBcryptUtils } from 'interfaces/common_interfaces/IBcryptUtils';
import { BcryptUtils } from '../shared/utils/password.hasher.helper';
import { IEmailUtils } from 'interfaces/common_interfaces/IEmailUtils';
import { EmailUtils } from '../shared/utils/email.transporter.helper';
import { IPaymentGateway } from '../infrastructure/payment-gateways/IPaymentGateway';
import { StripeGateway } from '../infrastructure/payment-gateways/StripeGateway';
export class CommonRegistry {
  static registerCommonDependencies() {
    container.register<IBcryptUtils>('IBcryptUtils', {
      useClass: BcryptUtils,
    });

    container.register<IEmailUtils>('IEmailUtils', {
      useClass: EmailUtils,
    });

    container.register<IPaymentGateway>('IPaymentGateway', {
      useClass: StripeGateway,
    });
  }
}
