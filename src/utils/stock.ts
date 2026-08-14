export type StockStatus = 'in' | 'low' | 'out';

export const LOW_STOCK_THRESHOLD = 15;

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out';
  if (stock < LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

export function formatCaseUnits(stock: number, unitsPerCase: number): string {
  if (!unitsPerCase || unitsPerCase <= 1) return `${stock} unit${stock === 1 ? '' : 's'}`;
  const cases = Math.floor(stock / unitsPerCase);
  const units = stock % unitsPerCase;
  if (cases === 0) return `${units} unit${units === 1 ? '' : 's'}`;
  if (units === 0) return `${cases} case${cases === 1 ? '' : 's'}`;
  return `${cases} case${cases === 1 ? '' : 's'} + ${units} unit${units === 1 ? '' : 's'}`;
}
