import { describe, expect, it } from 'vitest';
import { buildMonth, shiftMonth } from './calendar';
import { createAvailability } from './availability';
import { config } from '../config';

describe('buildMonth', () => {
  it('starts September 2026 (a Tuesday) under TUE when weeks start on Sunday', () => {
    const [first] = buildMonth(2026, 9, 0);
    expect(first.slice(0, 2)).toEqual([null, null]);
    expect(first[2]?.date.d).toBe(1);
  });

  it('starts September 2026 under TUE when weeks start on Monday, one column earlier', () => {
    const [first] = buildMonth(2026, 9, 1);
    expect(first.slice(0, 1)).toEqual([null]);
    expect(first[1]?.date.d).toBe(1);
  });

  it('always yields full weeks and every day once', () => {
    const weeks = buildMonth(2026, 2, 1);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks.flat().filter(Boolean)).toHaveLength(28);
  });
});

describe('shiftMonth', () => {
  it('wraps years in both directions', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ y: 2027, m: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ y: 2025, m: 12 });
  });
});

describe('availability', () => {
  const now = { date: { y: 2026, m: 9, d: 30 }, minutes: 10 * 60 };
  const availability = createAvailability(config, { busy: () => [{ start: 12 * 60, end: 13 * 60 }] });

  it('marks overlapping slots busy', () => {
    expect(availability.status(now.date, 12 * 60 + 30, now)).toBe('busy');
    expect(availability.status(now.date, 11 * 60 + 30, now)).toBe('free'); // ends at 12:00: touches, doesn't overlap
  });

  it('respects working hours, weekends and minimum notice', () => {
    expect(availability.status(now.date, 8 * 60, now)).toBe('off');
    expect(availability.status(now.date, 10 * 60 + 30, now)).toBe('off'); // < 1h notice
    expect(availability.status({ y: 2026, m: 10, d: 3 }, 11 * 60, now)).toBe('off'); // Saturday
    expect(availability.status(now.date, 14 * 60, now)).toBe('free');
  });

  it('never offers the past', () => {
    expect(availability.status({ y: 2026, m: 9, d: 29 }, 11 * 60, now)).toBe('off');
  });
});
