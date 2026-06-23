"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCELLATION_POLICIES = void 0;
exports.CANCELLATION_POLICIES = {
    flexible: {
        label: 'Flexible',
        rules: [
            { daysBeforeTrip: 7, refundPercent: 90 },
            { daysBeforeTrip: 5, refundPercent: 70 },
            { daysBeforeTrip: 2, refundPercent: 50 },
            { daysBeforeTrip: 0, refundPercent: 0 },
        ],
    },
    moderate: {
        label: 'Moderate',
        rules: [
            { daysBeforeTrip: 7, refundPercent: 80 },
            { daysBeforeTrip: 5, refundPercent: 50 },
            { daysBeforeTrip: 2, refundPercent: 30 },
            { daysBeforeTrip: 0, refundPercent: 0 },
        ],
    },
    strict: {
        label: 'Strict',
        rules: [
            { daysBeforeTrip: 7, refundPercent: 60 },
            { daysBeforeTrip: 5, refundPercent: 40 },
            { daysBeforeTrip: 0, refundPercent: 0 },
        ],
    },
    nonRefundable: {
        label: 'Non-Refundable',
        rules: [{ daysBeforeTrip: 0, refundPercent: 0 }],
    },
};
// minimum 10 days needs each trip creation
