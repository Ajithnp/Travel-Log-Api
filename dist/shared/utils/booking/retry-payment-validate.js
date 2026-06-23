"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetryWindowOpen = exports.getRetryDeadline = void 0;
const getRetryDeadline = (createdAt, startDate) => {
    const twentyFourHoursAfterCreation = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const twentyFourHoursBeforeTrip = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    return new Date(Math.min(twentyFourHoursAfterCreation.getTime(), twentyFourHoursBeforeTrip.getTime()));
};
exports.getRetryDeadline = getRetryDeadline;
const isRetryWindowOpen = (createdAt, startDate) => {
    return new Date() < (0, exports.getRetryDeadline)(createdAt, startDate);
};
exports.isRetryWindowOpen = isRetryWindowOpen;
