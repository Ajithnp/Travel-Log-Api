export type Granularity = 'day' | 'week' | 'month' | 'year';
 
export const getDateRange = (
  period: string,
  customFrom?: Date,
  customTo?: Date
): { from: Date; now: Date } => {
  if (period === 'custom' && customFrom && customTo) {
    return { from: new Date(customFrom), now: new Date(customTo) };
  }
 
  const now = new Date();
  const from = new Date();
 
  
  switch (period) {
    case '7d':   from.setDate(now.getDate() - 7);        break;
    case 'week':  from.setMonth(now.getMonth() - 1);      break; 
    case 'month': from.setMonth(now.getMonth() - 6);      break; 
    case 'year':  from.setFullYear(now.getFullYear() - 1); break;
    default:      from.setDate(now.getDate() - 7);
  }
 
  return { from, now };
};

export const getGranularity = (from: Date, to: Date, period: string  ): Granularity => {
  if (period === '7d')    return 'day';
  if (period === 'week')  return 'week';
  if (period === 'month') return 'month';
  if (period === 'year')  return 'year';


  const diffInDays =
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays <= 7)   return 'day';
  if (diffInDays <= 30)  return 'week';
  if (diffInDays <= 365) return 'month';
  return 'year';
};

 

export const GRANULARITY_FORMAT: Record<Granularity, string> = {
  day:   '%Y-%m-%d',
  week:  '%Y-W%U',
  month: '%Y-%m',
  year:  '%Y',         
};
 