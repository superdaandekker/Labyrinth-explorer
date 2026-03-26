/** Returns a stable index for the daily modifier based on the day of the year. */
export const getDailyModifierIndex = (modifierCount: number): number => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((+now - +startOfYear) / 86400000);
  return dayOfYear % modifierCount;
};
