export const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculatePercentage = (
  value: number,
  total: number,
  precision = 1
): number => {
  return total > 0 ? parseFloat(((value / total) * 100).toFixed(precision)) : 0;
};
