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
}
