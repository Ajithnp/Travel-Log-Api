export const getDateRangeByPeriod = (period: string): { from: Date; now: Date } => {
  const now = new Date();
  const from = new Date();

  switch (period) {
    case '7d':
      from.setDate(now.getDate() - 7);
      break;
    case '6m':
      from.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      from.setFullYear(now.getFullYear() - 1);
      break;
    default:
      from.setDate(now.getDate() - 30);
      break;
  }

  return { from, now };
};
