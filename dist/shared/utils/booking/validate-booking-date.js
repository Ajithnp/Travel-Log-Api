"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidator = void 0;
const AppError_1 = require("../../../errors/AppError");
const http_status_code_1 = require("../../../shared/constants/http_status_code");
const messages_1 = require("../../../shared/constants/messages");
class BookingValidator {
    static validateTripBookingDate(startDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const tripStartDate = new Date(startDate);
        tripStartDate.setHours(0, 0, 0, 0);
        if (currentDate > tripStartDate) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_CANNOT_BOOKED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    static validateBookingOffer(offer, packageId) {
        if (!offer) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
        }
        if (offer.packageId.toString() !== packageId.toString()) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_NOT_APPLICABLE_TO_THIS_PACKAGE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
        if (!offer.isActive) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_ALREADY_DEACTIVATED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
        const now = new Date();
        if (offer.validUntil < now) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_EXPIRED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
        if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OFFER_USAGE_LIMIT_EXCEEDED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
}
exports.BookingValidator = BookingValidator;
