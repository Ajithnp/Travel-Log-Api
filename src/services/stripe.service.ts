import { inject, injectable } from 'tsyringe';
import { IVendorInfoRepository } from '../interfaces/repository_interfaces/IVendorInfoRepository';
import {
  IStripeService,
  IStripeOnboardingStatusDTO,
} from '../interfaces/service_interfaces/IStripeService';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { VENDOR_VERIFICATION_STATUS } from '../types/enum/vendor-verfication-status.enum';
import { IPaymentGateway } from '../infrastructure/payment-gateways/IPaymentGateway';

@injectable()
export class StripeService implements IStripeService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IPaymentGateway')
    private _paymentGateway: IPaymentGateway,
  ) {}

  async createOnboardingLink(vendorId: string): Promise<{ onboardingUrl: string }> {
    const existingDoc = await this._vendorInfoRepository.findOne({
      userId: toObjectId(vendorId),
    });

    if (!existingDoc) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (existingDoc.status !== VENDOR_VERIFICATION_STATUS.APPROVED) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_VERIFIED, HTTP_STATUS.BAD_REQUEST);
    }

    let stripeAccountId = existingDoc.transactionConnect?.accountId;

    if (!stripeAccountId) {
      // Create new Express account
      stripeAccountId = await this._paymentGateway.createConnectAccount(vendorId);

      await this._vendorInfoRepository.updateStripeAccountId(vendorId, stripeAccountId);
    }
    const onboardingUrl = await this._paymentGateway.createAccountLink(stripeAccountId);
    return { onboardingUrl: onboardingUrl };
  }

  async getStripeOnboardingStatus(vendorId: string): Promise<IStripeOnboardingStatusDTO> {
    const existingDoc = await this._vendorInfoRepository.findOne({
      userId: toObjectId(vendorId),
    });

    if (!existingDoc?.transactionConnect?.accountId) {
      return {
        hasStripeAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      };
    }

    const account = await this._paymentGateway.retrieveAccount(
      existingDoc!.transactionConnect!.accountId!,
    );

    const onboardingComplete = account.details_submitted ?? false;
    const chargesEnabled = account.charges_enabled ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;

    await this._vendorInfoRepository.updateStripeAccountStatus(
      vendorId,
      onboardingComplete,
      chargesEnabled,
      payoutsEnabled,
    );

    return {
      hasStripeAccount: true,
      onboardingComplete,
      chargesEnabled,
      payoutsEnabled,
    };
  }
}
