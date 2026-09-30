/**
 * Date helpers pinned to one IANA time zone.
 *
 * The whole app reasons in "wall-clock Madrid time" (a calendar day plus minutes
 * since midnight) so the result never depends on where the visitor's browser is.
 * Only when we need a real instant (sun position, .ics export) do we convert.
 */

export const TIME_ZONE = 'Europe/Madrid';

export interface YMD {
  y: number;
  m: number; // 1–12
  d: number; // 1–31
}

const pad = (n: number) => String(n).padStart(2, '0');

export const dateKey = ({ y, m, d }: YMD) => `${y}-${pad(m)}-${pad(d)}`;

export function parseKey(key: string): YMD {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

/** Day of week, 0 = Sunday … 6 = Saturday. */
export const weekday = ({ y, m, d }: YMD) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

export function addDays({ y, m, d }: YMD, days: number): YMD {
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export const compareYMD = (a: YMD, b: YMD) => dateKey(a).localeCompare(dateKey(b));

let partsFormat: Intl.DateTimeFormat | undefined;

function wallParts(instantMs: number) {
  partsFormat ??= new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });
  const out: Record<string, number> = {};
  for (const p of partsFormat.formatToParts(instantMs)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  return out;
}

/** The current Madrid date and minutes since local midnight (fractional). */
export function madridNow(now: Date = new Date()): { date: YMD; minutes: number } {
  const p = wallParts(now.getTime());
  return {
    date: { y: p.year, m: p.month, d: p.day },
    minutes: p.hour * 60 + p.minute + p.second / 60,
  };
}

function offsetMs(instantMs: number): number {
  const p = wallParts(instantMs);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wall - Math.floor(instantMs / 1000) * 1000;
}

/** Convert a Madrid wall-clock moment into a real instant (handles DST). */
export function madridToDate(date: YMD, minutes: number): Date {
  const wall = Date.UTC(date.y, date.m - 1, date.d) + minutes * 60_000;
  const guess = wall - offsetMs(wall);
  return new Date(wall - offsetMs(guess));
}

/** Short zone name such as "CEST" or "GMT+2" for a given moment. */
export function zoneLabel(date: YMD, minutes: number, locale: string): string {
  const instant = madridToDate(date, minutes);
  const part = new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, timeZoneName: 'short' })
    .formatToParts(instant)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? TIME_ZONE;
}
