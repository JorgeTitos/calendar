import type { Config } from '../config';
import { addDays, compareYMD, dateKey, weekday, type YMD } from './time';

export interface Interval {
  /** Minutes since midnight. */
  start: number;
  end: number;
}

/**
 * Where "busy" comes from. Swap the demo provider for one that reads your real
 * calendar (Google Calendar free/busy, Cal.com, an .ics feed…) — see the README.
 */
export interface AvailabilityProvider {
  busy(date: YMD): Interval[];
}

export type SlotStatus = 'free' | 'busy' | 'off';

export interface Now {
  date: YMD;
  minutes: number;
}

// Small deterministic PRNG so the demo calendar looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Fake but plausible meetings, stable per date. */
export const demoProvider: AvailabilityProvider = {
  busy(date) {
    const rand = mulberry32(hash(dateKey(date)));
    const blocks: Interval[] = [];
    let cursor = 9 * 60 + Math.floor(rand() * 4) * 30;
    while (cursor < 20 * 60) {
      const length = (1 + Math.floor(rand() * 4)) * 30;
      blocks.push({ start: cursor, end: cursor + length });
      cursor += length + (2 + Math.floor(rand() * 5)) * 30;
    }
    return blocks;
  },
};

export function createAvailability(config: Config, provider: AvailabilityProvider = demoProvider) {
  const { availability, meeting } = config;

  function status(date: YMD, start: number, now: Now): SlotStatus {
    const end = start + meeting.durationMinutes;
    if (!availability.days.includes(weekday(date))) return 'off';
    if (start < availability.startMinutes || end > availability.endMinutes) return 'off';

    const order = compareYMD(date, now.date);
    if (order < 0) return 'off';
    if (order === 0 && start < now.minutes + availability.minNoticeMinutes) return 'off';
    if (compareYMD(date, addDays(now.date, availability.maxDaysAhead)) > 0) return 'off';

    const clash = provider.busy(date).some((b) => start < b.end && end > b.start);
    return clash ? 'busy' : 'free';
  }

  function freeSlots(date: YMD, now: Now): number[] {
    const { startMinutes, endMinutes, stepMinutes } = config.timeline;
    const slots: number[] = [];
    for (let s = startMinutes; s + meeting.durationMinutes <= endMinutes; s += stepMinutes) {
      if (status(date, s, now) === 'free') slots.push(s);
    }
    return slots;
  }

  return {
    status,
    freeSlots,
    busy: (date: YMD) => provider.busy(date),
    isDayOpen: (date: YMD, now: Now) => freeSlots(date, now).length > 0,
  };
}

export type Availability = ReturnType<typeof createAvailability>;
