"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysUntilTrip = getDaysUntilTrip;
exports.getApplicableRule = getApplicableRule;
exports.computeRefundBreakdown = computeRefundBreakdown;
function getDaysUntilTrip(tripStartDate, today) {
    const diffMs = tripStartDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
function getApplicableRule(rules, daysUntilTrip) {
    const sorted = [...rules].sort((a, b) => b.daysBeforeTrip - a.daysBeforeTrip);
    const matched = sorted.find((rule) => daysUntilTrip >= rule.daysBeforeTrip);
    return matched !== null && matched !== void 0 ? matched : sorted[sorted.length - 1];
}
function computeRefundBreakdown(originalAmount, policy, tripStartDate, today = new Date()) {
    const daysUntilTrip = getDaysUntilTrip(tripStartDate, today);
    const appliedRule = getApplicableRule(policy.rules, daysUntilTrip);
    const refundAmount = parseFloat(((originalAmount * appliedRule.refundPercent) / 100).toFixed(2));
    const deductionAmount = parseFloat((originalAmount - refundAmount).toFixed(2));
    return {
        originalAmount,
        refundPercent: appliedRule.refundPercent,
        refundAmount,
        deductionAmount,
        daysUntilTrip,
        appliedRule,
        policyKey: policy.key,
        policyLabel: policy.label,
        calculatedAt: today,
    };
}
