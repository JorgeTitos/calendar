import { solarPosition } from './sun';
import { madridToDate, type YMD } from './time';

/** Puerta del Sol, Madrid. */
export const MADRID = { latitude: 40.4168, longitude: -3.7038 } as const;

/** How the photograph should be lit at one moment. */
export interface SkyLook {
  /** Brightness multiplier applied to the photo itself. */
  exposure: number;
  saturation: number;
  /** Colour cast, multiplied over the photo from top to horizon. */
  tintTop: string;
  tintHorizon: string;
  /** How strongly the colour cast applies (0 = the untouched photo). */
  grade: number;
  sun: string;
  sunGlow: string;
  sunGlowOpacity: number; // 0–1
  stars: number; // 0–1
  windows: number; // 0–1, how many lights are on
}

type Rgb = [number, number, number];
type ColorKey = {
  [K in keyof SkyLook]: SkyLook[K] extends string ? K : never;
}[keyof SkyLook];
type NumberKey = Exclude<keyof SkyLook, ColorKey>;

const COLOR_KEYS: ColorKey[] = ['tintTop', 'tintHorizon', 'sun', 'sunGlow'];
const NUMBER_KEYS: NumberKey[] = ['exposure', 'saturation', 'grade', 'sunGlowOpacity', 'stars', 'windows'];

/**
 * Lighting keyframes, indexed by the sun's elevation in degrees.
 * Using the sun (not the clock) means sunrise and sunset land at the right
 * hour for the selected date: a September evening is not a December one.
 */
const KEYFRAMES: Array<{ at: number; look: SkyLook }> = [
  {
    at: -18,
    look: {
      exposure: 0.62, saturation: 0.6, tintTop: '#101c48', tintHorizon: '#26386e', grade: 0.86,
      sun: '#ffb060', sunGlow: '#ff8a3c', sunGlowOpacity: 0, stars: 1, windows: 1,
    },
  },
  {
    at: -12,
    look: {
      exposure: 0.7, saturation: 0.8, tintTop: '#2a3270', tintHorizon: '#71508c', grade: 0.82,
      sun: '#ffb060', sunGlow: '#ff8a3c', sunGlowOpacity: 0.1, stars: 0.55, windows: 1,
    },
  },
  {
    at: -6,
    look: {
      exposure: 0.82, saturation: 1.05, tintTop: '#6a58a0', tintHorizon: '#ff8a5c', grade: 0.78,
      sun: '#ff9a4a', sunGlow: '#ff7a3a', sunGlowOpacity: 0.55, stars: 0.06, windows: 0.4,
    },
  },
  {
    at: -1,
    look: {
      exposure: 0.9, saturation: 1.25, tintTop: '#d68f88', tintHorizon: '#ffb070', grade: 0.7,
      sun: '#ffa850', sunGlow: '#ff8c3c', sunGlowOpacity: 1, stars: 0, windows: 0.1,
    },
  },
  {
    at: 5,
    look: {
      exposure: 1, saturation: 1.15, tintTop: '#f0c8a4', tintHorizon: '#ffd8a0', grade: 0.5,
      sun: '#ffd28a', sunGlow: '#ffb060', sunGlowOpacity: 0.85, stars: 0, windows: 0,
    },
  },
  {
    at: 16,
    look: {
      exposure: 1.03, saturation: 1.08, tintTop: '#f6eee0', tintHorizon: '#fff4e0', grade: 0.2,
      sun: '#fff3d0', sunGlow: '#ffe6a8', sunGlowOpacity: 0.6, stars: 0, windows: 0,
    },
  },
  {
    at: 35,
    look: {
      exposure: 1.06, saturation: 1.12, tintTop: '#ffffff', tintHorizon: '#ffffff', grade: 0,
      sun: '#fffbe8', sunGlow: '#fff2c4', sunGlowOpacity: 0.55, stars: 0, windows: 0,
    },
  },
];

const parseHex = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const mixHex = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(ar, br)}, ${c(ag, bg)}, ${c(ab, bb)})`;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Interpolated look for a given solar elevation (degrees). */
export function lookForElevation(elevation: number): SkyLook {
  const first = KEYFRAMES[0];
  const last = KEYFRAMES[KEYFRAMES.length - 1];
  if (elevation <= first.at) return first.look;
  if (elevation >= last.at) return last.look;

  const i = KEYFRAMES.findIndex((k) => k.at > elevation);
  const lo = KEYFRAMES[i - 1];
  const hi = KEYFRAMES[i];
  const t = smooth((elevation - lo.at) / (hi.at - lo.at));

  const out = {} as SkyLook;
  for (const key of COLOR_KEYS) out[key] = mixHex(lo.look[key], hi.look[key], t);
  for (const key of NUMBER_KEYS) out[key] = lo.look[key] + (hi.look[key] - lo.look[key]) * t;
  return out;
}

export interface Sky {
  look: SkyLook;
  sunElevation: number;
  /** Fake-but-pleasing moon opposite the sun. */
  moon: { azimuth: number; elevation: number; opacity: number };
  sun: { azimuth: number; elevation: number; opacity: number };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The sky over Madrid at `minutes` past midnight (Madrid time) on `date`. */
export function skyAt(date: YMD, minutes: number): Sky {
  const { elevation, azimuth } = solarPosition(
    madridToDate(date, minutes),
    MADRID.latitude,
    MADRID.longitude,
  );
  return {
    look: lookForElevation(elevation),
    sunElevation: elevation,
    sun: { azimuth, elevation, opacity: clamp01((elevation + 6) / 6) },
    moon: {
      azimuth: (azimuth + 180) % 360,
      elevation: -elevation,
      opacity: clamp01((-elevation - 4) / 8),
    },
  };
}
