import { IOfferEntity } from 'types/entities/offer.entity';
import { AppError } from '../../../errors/AppError';
import { HTTP_STATUS } from '../../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

export class BookingValidator {
  static validateTripBookingDate(startDate: Date | string): void {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const tripStartDate = new Date(startDate);
    tripStartDate.setHours(0, 0, 0, 0);

    if (currentDate > tripStartDate) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_CANNOT_BOOKED, HTTP_STATUS.BAD_REQUEST);
    }
  }

  static validateBookingOffer(offer: IOfferEntity | null, packageId: string): void {
    if (!offer) {
      throw new AppError(ERROR_MESSAGES.OFFER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (offer.packageId.toString() !== packageId.toString()) {
      throw new AppError(
        ERROR_MESSAGES.OFFER_NOT_APPLICABLE_TO_THIS_PACKAGE,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!offer.isActive) {
      throw new AppError(ERROR_MESSAGES.OFFER_ALREADY_DEACTIVATED, HTTP_STATUS.BAD_REQUEST);
    }

    const now = new Date();
    if (offer.validUntil < now) {
      throw new AppError(ERROR_MESSAGES.OFFER_EXPIRED, HTTP_STATUS.BAD_REQUEST);
    }

    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      throw new AppError(ERROR_MESSAGES.OFFER_USAGE_LIMIT_EXCEEDED, HTTP_STATUS.BAD_REQUEST);
    }
  }
}
