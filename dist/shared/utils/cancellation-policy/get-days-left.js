"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysLeft = getDaysLeft;
exports.getApplicableCancellationWindow = getApplicableCancellationWindow;
const date_fns_1 = require("date-fns");
function getDaysLeft(startDateISO) {
    const startDate = new Date(startDateISO);
    const currentDate = new Date();
    return (0, date_fns_1.differenceInCalendarDays)(startDate, currentDate);
}
function getApplicableCancellationWindow(rules, tripStartDate) {
    const daysLeft = getDaysLeft(tripStartDate);
    const minimumApplicableDays = Math.min(...rules.map((rule) => rule.daysBeforeTrip));
    if (daysLeft < minimumApplicableDays) {
        return {
            isWindowApplicable: false,
            daysLeft: daysLeft,
        };
    }
    return {
        isWindowApplicable: true,
        daysLeft: daysLeft,
    };
}
