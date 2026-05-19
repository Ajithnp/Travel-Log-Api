import { differenceInCalendarDays } from "date-fns";
import { ICancellationRule } from "types/entities/cancellation-policy.entity";

export function getDaysLeft(startDateISO: string): number {
  const startDate = new Date(startDateISO);

  const currentDate = new Date();

  return differenceInCalendarDays(startDate, currentDate);
}

export function getApplicableCancellationWindow ( rules: ICancellationRule[], tripStartDate: string):{
    isWindowApplicable : boolean,
    daysLeft: number
} {

  const daysLeft = getDaysLeft(tripStartDate);

  const minimumApplicableDays  = Math.min(...rules.map(rule => rule.daysBeforeTrip));

  if(daysLeft < minimumApplicableDays){
    return {
        isWindowApplicable : false,
        daysLeft: daysLeft
    };
  }

  return {
    isWindowApplicable : true,
    daysLeft: daysLeft
  };
}