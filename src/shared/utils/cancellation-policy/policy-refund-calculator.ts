import { CancellationPolicy, CancellationRule } from "../../../shared/mappers/booking.mapper";



export interface RefundBreakdown {
  originalAmount: number;
  refundPercent: number;
  refundAmount: number;
  deductionAmount: number;
  daysUntilTrip: number;
  appliedRule: CancellationRule;
  policyKey: string;
  policyLabel: string;
  calculatedAt: Date;         
}

export function getDaysUntilTrip(tripStartDate: Date, today: Date): number {
  const diffMs = tripStartDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getApplicableRule(
  rules: CancellationRule[],
  daysUntilTrip: number
): CancellationRule {
  
  const sorted = [...rules].sort((a, b) => b.daysBeforeTrip - a.daysBeforeTrip);

  const matched = sorted.find((rule) => daysUntilTrip >= rule.daysBeforeTrip);

  
  return matched ?? sorted[sorted.length - 1];
}

export function computeRefundBreakdown(
  originalAmount: number,
  policy: CancellationPolicy,
  tripStartDate: Date,
  today: Date = new Date()   
): RefundBreakdown {

  const daysUntilTrip = getDaysUntilTrip(tripStartDate, today);
  const appliedRule   = getApplicableRule(policy.rules, daysUntilTrip);

  const refundAmount    = parseFloat(((originalAmount * appliedRule.refundPercent) / 100).toFixed(2));
  const deductionAmount = parseFloat((originalAmount - refundAmount).toFixed(2));

  return {
    originalAmount,
    refundPercent:   appliedRule.refundPercent,
    refundAmount,
    deductionAmount,
    daysUntilTrip,
    appliedRule,
    policyKey:       policy.key,
    policyLabel:     policy.label,
    calculatedAt:    today,
  };
}