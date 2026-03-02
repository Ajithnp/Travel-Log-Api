export const CANCELLATION_POLICIES = {
  flexible: {
    label: 'Flexible',
    rules: [
      { daysBeforeTrip: 5, refundPercent: 90 },
      { daysBeforeTrip: 3, refundPercent: 50 },
      { daysBeforeTrip: 0, refundPercent: 0 },
    ],
  },

  moderate: {
    label: 'Moderate',
    rules: [
      { daysBeforeTrip: 7, refundPercent: 80 },
      { daysBeforeTrip: 5, refundPercent: 50 },
      { daysBeforeTrip: 0, refundPercent: 0 },
    ],
  },

  strict: {
    label: 'Strict',
    rules: [
      { daysBeforeTrip: 12, refundPercent: 70 },
      { daysBeforeTrip: 7, refundPercent: 30 },
      { daysBeforeTrip: 0, refundPercent: 0 },
    ],
  },

  nonRefundable: {
    label: 'Non-Refundable',
    rules: [{ daysBeforeTrip: 0, refundPercent: 0 }],
  },
};
