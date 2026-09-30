/**
 * Everything you are likely to customise lives here.
 * Times are minutes since midnight in Madrid time (see `TIME_ZONE` in lib/time.ts).
 */
export const config = {
  /** Shown in the copy: "Pick a day to see when {owner} is free." */
  owner: 'Jorge',

  meeting: {
    durationMinutes: 30,
    provider: 'Google Meet',
  },

  availability: {
    /** 0 = Sunday … 6 = Saturday. */
    days: [1, 2, 3, 4, 5],
    startMinutes: 9 * 60,
    endMinutes: 21 * 60,
    /** Can't book something starting in less than this. */
    minNoticeMinutes: 60,
    maxDaysAhead: 60,
  },

  /** The hours drawn on the day timeline. Wider than availability on purpose:
   *  hovering an unavailable hour still lets you watch the sky change. */
  timeline: {
    startMinutes: 7 * 60,
    endMinutes: 24 * 60,
    stepMinutes: 30,
  },

  /** Optional "Home" pill in the top-left corner. Leave empty to hide it. */
  homeUrl: '',

  /** Force a UI language ('es' | 'en'). Leave undefined to follow the browser. */
  locale: undefined as 'es' | 'en' | undefined,
};

export type Config = typeof config;
