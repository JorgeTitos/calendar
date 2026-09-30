import { solarPosition } from './sun';
import { madridToDate, type YMD } from './time';

/** Puerta del Sol, Madrid. */
export const MADRID = { latitude: 40.4168, longitude: -3.7038 } as const;

/** Everything the skyline needs to know to look right at one moment. */
export interface SkyLook {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  /** Distant hazy layer (Cuatro Torres, far rooftops). */
  far: string;
  mid: string;
  near: string;
  ground: string;
  tree: string;
  cloud: string;
  sun: string;
  sunGlow: string;
  stars: number; // 0–1
  windows: number; // 0–1, how many lights are on
  sunGlowOpacity: number; // 0–1
}

type Rgb = [number, number, number];
type ColorKey = {
  [K in keyof SkyLook]: SkyLook[K] extends string ? K : never;
}[keyof SkyLook];
type NumberKey = Exclude<keyof SkyLook, ColorKey>;

const COLOR_KEYS: ColorKey[] = [
  'skyTop', 'skyMid', 'skyHorizon', 'far', 'mid', 'near', 'ground', 'tree', 'cloud', 'sun', 'sunGlow',
];
const NUMBER_KEYS: NumberKey[] = ['stars', 'windows', 'sunGlowOpacity'];

/**
 * Palette keyframes, indexed by the sun's elevation in degrees.
 * Using the sun (not the clock) means sunrise and sunset land at the right
 * hour for the selected date: a September evening is not a December one.
 */
const KEYFRAMES: Array<{ at: number; look: SkyLook }> = [
  {
    at: -18,
    look: {
      skyTop: '#03050d', skyMid: '#070c1c', skyHorizon: '#101a33',
      far: '#0d1428', mid: '#090e1c', near: '#05070f', ground: '#04060c', tree: '#050809',
      cloud: '#1a2140', sun: '#ffb060', sunGlow: '#ff8a3c',
      stars: 1, windows: 1, sunGlowOpacity: 0,
    },
  },
  {
    at: -12,
    look: {
      skyTop: '#0a1030', skyMid: '#262a5a', skyHorizon: '#4a3a6e',
      far: '#1c2044', mid: '#141833', near: '#0a0c1c', ground: '#080a16', tree: '#080b12',
      cloud: '#3a3468', sun: '#ffb060', sunGlow: '#ff8a3c',
      stars: 0.55, windows: 1, sunGlowOpacity: 0.1,
    },
  },
  {
    at: -6,
    look: {
      skyTop: '#1a2a5e', skyMid: '#5b4a86', skyHorizon: '#e0785a',
      far: '#4a3a70', mid: '#2e2758', near: '#15132b', ground: '#100f22', tree: '#12111f',
      cloud: '#e8907a', sun: '#ff9a4a', sunGlow: '#ff7a3a',
      stars: 0.08, windows: 0.85, sunGlowOpacity: 0.55,
    },
  },
  {
    at: -1,
    look: {
      skyTop: '#2c4a80', skyMid: '#c98a7c', skyHorizon: '#ffa860',
      far: '#7a5a78', mid: '#4f3d60', near: '#251d33', ground: '#1c1726', tree: '#231c2c',
      cloud: '#ffb088', sun: '#ffa850', sunGlow: '#ff8c3c',
      stars: 0, windows: 0.5, sunGlowOpacity: 1,
    },
  },
  {
    at: 4,
    look: {
      skyTop: '#4a7fb5', skyMid: '#eab48a', skyHorizon: '#ffd08a',
      far: '#9a8a9a', mid: '#75697a', near: '#3c3546', ground: '#2c2c30', tree: '#332f36',
      cloud: '#ffe0b8', sun: '#ffd28a', sunGlow: '#ffb060',
      stars: 0, windows: 0.12, sunGlowOpacity: 0.85,
    },
  },
  {
    at: 14,
    look: {
      skyTop: '#4c8ad0', skyMid: '#93c1e8', skyHorizon: '#f0e3cf',
      far: '#a9b7c9', mid: '#8896aa', near: '#56626f', ground: '#3f4a3f', tree: '#33503a',
      cloud: '#ffffff', sun: '#fff3d0', sunGlow: '#ffe6a8',
      stars: 0, windows: 0, sunGlowOpacity: 0.5,
    },
  },
  {
    at: 35,
    look: {
      skyTop: '#3b82d6', skyMid: '#86bdec', skyHorizon: '#d5eaf8',
      far: '#adc1d6', mid: '#8a9fb6', near: '#5a6b7d', ground: '#435243', tree: '#35583e',
      cloud: '#ffffff', sun: '#fffbe8', sunGlow: '#fff2c4',
      stars: 0, windows: 0, sunGlowOpacity: 0.35,
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
