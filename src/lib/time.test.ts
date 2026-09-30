import { describe, expect, it } from 'vitest';
import { addDays, madridNow, madridToDate, weekday } from './time';

describe('madridToDate', () => {
  it('uses UTC+2 in summer (CEST)', () => {
    expect(madridToDate({ y: 2026, m: 9, d: 30 }, 18 * 60 + 30).toISOString()).toBe('2026-09-30T16:30:00.000Z');
  });

  it('uses UTC+1 in winter (CET)', () => {
    expect(madridToDate({ y: 2026, m: 1, d: 15 }, 9 * 60).toISOString()).toBe('2026-01-15T08:00:00.000Z');
  });

  it('round-trips through madridNow, including across midnight', () => {
    const instant = madridToDate({ y: 2026, m: 10, d: 1 }, 0);
    expect(madridNow(instant)).toEqual({ date: { y: 2026, m: 10, d: 1 }, minutes: 0 });
  });

  it('handles the spring-forward day', () => {
    // 2026-03-29: clocks jump from 02:00 to 03:00 in Madrid.
    expect(madridToDate({ y: 2026, m: 3, d: 29 }, 12 * 60).toISOString()).toBe('2026-03-29T10:00:00.000Z');
  });
});

describe('date arithmetic', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays({ y: 2026, m: 12, d: 31 }, 1)).toEqual({ y: 2027, m: 1, d: 1 });
  });

  it('knows that 30 Sep 2026 is a Wednesday', () => {
    expect(weekday({ y: 2026, m: 9, d: 30 })).toBe(3);
  });
});
