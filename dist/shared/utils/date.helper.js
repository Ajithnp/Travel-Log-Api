"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRANULARITY_FORMAT = exports.getGranularity = exports.getDateRange = void 0;
const getDateRange = (period, customFrom, customTo) => {
    if (period === 'custom' && customFrom && customTo) {
        return { from: new Date(customFrom), now: new Date(customTo) };
    }
    const now = new Date();
    const from = new Date();
    switch (period) {
        case '7d':
            from.setDate(now.getDate() - 7);
            break;
        case 'week':
            from.setMonth(now.getMonth() - 1);
            break;
        case 'month':
            from.setMonth(now.getMonth() - 6);
            break;
        case 'year':
            from.setFullYear(now.getFullYear() - 1);
            break;
        default:
            from.setDate(now.getDate() - 7);
    }
    return { from, now };
};
exports.getDateRange = getDateRange;
const getGranularity = (from, to, period) => {
    if (period === '7d')
        return 'day';
    if (period === 'week')
        return 'week';
    if (period === 'month')
        return 'month';
    if (period === 'year')
        return 'year';
    const diffInDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays <= 7)
        return 'day';
    if (diffInDays <= 30)
        return 'week';
    if (diffInDays <= 365)
        return 'month';
    return 'year';
};
exports.getGranularity = getGranularity;
exports.GRANULARITY_FORMAT = {
    day: '%Y-%m-%d',
    week: '%Y-W%U',
    month: '%Y-%m',
    year: '%Y',
};
