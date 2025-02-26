export const getStartOfWeek = (date) => {
  const startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = startDate.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  startDate.setUTCDate(startDate.getUTCDate() + diff);
  return startDate;
};

export const getTodayDay = () => {
  const today = new Date();
  const currentDay = today.getUTCDay();
  const daysAbbreviation = ["paz", "pzt", "sal", "çrş", "per", "cum", "cts"];
  return daysAbbreviation[currentDay];
};