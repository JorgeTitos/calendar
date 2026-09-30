import { TIME_ZONE, dateKey, parseKey, type YMD } from './time';

export type Locale = 'es' | 'en';

export const dictionary = {
  en: {
    intro: (owner: string) => `Pick a day to see when ${owner} is free.`,
    pickTime: 'Pick an open time.',
    title: 'Book a time',
    pickDay: 'Pick a day',
    pickTimeCta: 'Pick a time',
    continue: 'Continue',
    detailsTitle: 'Your details',
    back: 'Back',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    email: 'Email',
    notes: 'What would you like to talk about? (optional)',
    confirm: 'Confirm',
    confirming: 'Confirming…',
    busy: 'Busy',
    unavailable: 'Unavailable',
    timesAvailable: (n: number) => `${n} time${n === 1 ? '' : 's'} available`,
    noTimes: 'No times available',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    closeDay: 'Close day view',
    home: 'Home',
    doneTitle: "You're booked",
    doneBody: (name: string) => `Thanks, ${name}. A calendar invite is on its way.`,
    addToCalendar: 'Add to calendar',
    bookAnother: 'Book another time',
    error: 'Something went wrong. Please try again.',
    invalidEmail: 'Please enter a valid email.',
    nameRequired: 'Please tell me your name.',
    now: 'Now',
  },
  es: {
    intro: (owner: string) => `Elige un día para ver cuándo está libre ${owner}.`,
    pickTime: 'Elige una hora libre.',
    title: 'Reserva una hora',
    pickDay: 'Elige un día',
    pickTimeCta: 'Elige una hora',
    continue: 'Continuar',
    detailsTitle: 'Tus datos',
    back: 'Atrás',
    date: 'Fecha',
    time: 'Hora',
    name: 'Nombre',
    email: 'Email',
    notes: '¿De qué te gustaría hablar? (opcional)',
    confirm: 'Confirmar',
    confirming: 'Confirmando…',
    busy: 'Ocupado',
    unavailable: 'No disponible',
    timesAvailable: (n: number) => `${n} ${n === 1 ? 'hora libre' : 'horas libres'}`,
    noTimes: 'Sin horas libres',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    closeDay: 'Cerrar vista del día',
    home: 'Inicio',
    doneTitle: 'Reserva confirmada',
    doneBody: (name: string) => `Gracias, ${name}. Te llegará una invitación al calendario.`,
    addToCalendar: 'Añadir al calendario',
    bookAnother: 'Reservar otra hora',
    error: 'Algo ha fallado. Inténtalo de nuevo.',
    invalidEmail: 'Introduce un email válido.',
    nameRequired: 'Dime tu nombre, por favor.',
    now: 'Ahora',
  },
} as const;

export type Strings = (typeof dictionary)[Locale];

export function detectLocale(preferred?: Locale): Locale {
  if (preferred) return preferred;
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'es';
  return lang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/** Spanish calendars start on Monday; US-style ones on Sunday. */
export const weekStartsOn = (locale: Locale): 0 | 1 => (locale === 'es' ? 1 : 0);

const uses24h = (locale: Locale) => locale === 'es';
const pad = (n: number) => String(n).padStart(2, '0');

/** "6:30" — the big clock digits (no am/pm). */
export function formatClock(minutes: number, locale: Locale): string {
  const total = Math.floor(minutes) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return uses24h(locale) ? `${pad(h)}:${pad(m)}` : `${h % 12 || 12}:${pad(m)}`;
}

/** "6:30 PM" or "18:30". */
export function formatTime(minutes: number, locale: Locale): string {
  const total = Math.round(minutes) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (uses24h(locale)) return `${pad(h)}:${pad(m)}`;
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "8 AM" / "8:00" — hour marks on the timeline. */
export function formatHour(minutes: number, locale: Locale): string {
  const h = Math.floor(minutes / 60) % 24;
  return uses24h(locale) ? `${h}:00` : `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "6:30 – 7:00 PM" (English) or "18:30 – 19:00". */
export function formatRange(start: number, end: number, locale: Locale): string {
  if (uses24h(locale)) return `${formatTime(start, locale)} – ${formatTime(end, locale)}`;
  const s = formatTime(start, locale);
  const e = formatTime(end, locale);
  return s.slice(-2) === e.slice(-2) ? `${s.slice(0, -3)} – ${e}` : `${s} – ${e}`;
}

const asUtcNoon = ({ y, m, d }: YMD) => new Date(Date.UTC(y, m - 1, d, 12));

const fmt = (locale: Locale, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options });

export const formatLongDate = (date: YMD, locale: Locale) =>
  capitalize(fmt(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(asUtcNoon(date)));

export const formatShortDate = (date: YMD, locale: Locale) =>
  capitalize(fmt(locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(asUtcNoon(date)));

export const formatMonthTitle = (y: number, m: number, locale: Locale) =>
  capitalize(fmt(locale, { month: 'long', year: 'numeric' }).format(asUtcNoon({ y, m, d: 1 })));

export const formatMonthDay = (date: YMD, locale: Locale) =>
  capitalize(fmt(locale, { month: 'long', day: 'numeric' }).format(asUtcNoon(date)));

export const formatWeekday = (date: YMD, locale: Locale) =>
  capitalize(fmt(locale, { weekday: 'long' }).format(asUtcNoon(date)));

/** Three-letter weekday headers in column order, e.g. ["MON", …]. */
export function weekdayHeaders(locale: Locale, startsOn: 0 | 1): string[] {
  // 2026-08-02 is a Sunday, so day offset 0 = Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const day = 2 + ((i + startsOn) % 7);
    const label = fmt(locale, { weekday: 'short' }).format(asUtcNoon({ y: 2026, m: 8, d: day }));
    return label.replace('.', '').slice(0, 3).toUpperCase();
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { TIME_ZONE, dateKey, parseKey };
