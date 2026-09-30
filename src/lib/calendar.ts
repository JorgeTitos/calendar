import { daysInMonth, type YMD } from './time';

export interface MonthCell {
  date: YMD;
}

/**
 * Weeks of a month as rows of 7 cells. Cells before the 1st and after the last
 * day are `null` (the design leaves them blank instead of showing neighbours).
 */
export function buildMonth(y: number, m: number, weekStartsOn: 0 | 1): Array<Array<MonthCell | null>> {
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const lead = (firstWeekday - weekStartsOn + 7) % 7;
  const total = daysInMonth(y, m);

  const cells: Array<MonthCell | null> = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: total }, (_, i) => ({ date: { y, m, d: i + 1 } })),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<MonthCell | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function shiftMonth(y: number, m: number, delta: number): { y: number; m: number } {
  const index = y * 12 + (m - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}
