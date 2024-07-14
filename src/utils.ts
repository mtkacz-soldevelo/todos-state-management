const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const EntityUtils = {
  generateUniqueId,
};

const calculatePercentage = (
  value: number,
  total: number,
  precision = 1
): number => {
  return total > 0 ? parseFloat(((value / total) * 100).toFixed(precision)) : 0;
};

export const MathUtils = {
  calculatePercentage,
};

const sleep = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const AsyncUtils = {
  sleep,
};
