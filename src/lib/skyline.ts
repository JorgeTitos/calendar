/**
 * Procedural Madrid skyline, drawn in a 1600×900 viewBox: the Cuatro Torres
 * business area rising over low-rise rooftops, with the Sierra de Guadarrama
 * behind. Everything is deterministic (seeded), so the picture is identical on
 * every load and nothing is fetched: no photos, no licences, just SVG paths.
 */

export const VIEW = { width: 1600, height: 900 } as const;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => Math.round(v * 10) / 10;

type Roof = 'flat' | 'pitched' | 'chimney';

/** A row of low-rise buildings of varying height, plus their lit windows. */
function buildRow(opts: {
  seed: number;
  from: number;
  to: number;
  width: [number, number];
  top: [number, number];
  overlap: number;
  windows: boolean;
}) {
  const rand = mulberry32(opts.seed);
  let body = '';
  let lit = '';
  let x = opts.from;

  while (x < opts.to) {
    const w = opts.width[0] + rand() * (opts.width[1] - opts.width[0]);
    const top = opts.top[0] + rand() * (opts.top[1] - opts.top[0]);
    const roofRoll = rand();
    const roof: Roof = roofRoll < 0.25 ? 'pitched' : roofRoll < 0.45 ? 'chimney' : 'flat';

    if (roof === 'pitched') {
      body += `M${n(x)} 900V${n(top + 14)}L${n(x + w / 2)} ${n(top)}L${n(x + w)} ${n(top + 14)}V900Z`;
    } else {
      body += `M${n(x - 2)} 900V${n(top)}H${n(x + w + 2)}V900ZM${n(x - 3)} ${n(top - 3)}h${n(w + 6)}v4h${n(-w - 6)}z`;
      if (roof === 'chimney') body += `M${n(x + w * 0.65)} ${n(top - 16)}h6v16h-6z`;
    }

    if (opts.windows) {
      const cols = Math.max(2, Math.floor((w - 10) / 12));
      const rows = Math.floor((895 - top - 14) / 17);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() < 0.4) lit += `M${n(x + 7 + c * 12)} ${n(top + 14 + r * 17)}h5v8h-5z`;
        }
      }
    }
    x += w - opts.overlap + rand() * 4;
  }
  return { body, lit };
}

const back = buildRow({ seed: 5, from: -40, to: 1640, width: [50, 96], top: [660, 735], overlap: 8, windows: true });
const mid = buildRow({ seed: 7, from: -30, to: 1640, width: [54, 110], top: [720, 790], overlap: 6, windows: true });
const front = buildRow({ seed: 13, from: -20, to: 1640, width: [70, 140], top: [812, 858], overlap: 4, windows: false });

/** Two ridges of the Sierra de Guadarrama, far and near. */
function ridge(base: number, amp: number, phase: number): string {
  let d = `M-10 900V${n(base)}`;
  for (let x = -10; x <= 1610; x += 20) {
    const y =
      base -
      amp * (0.55 + 0.45 * Math.sin(x / 210 + phase)) -
      amp * 0.35 * Math.sin(x / 71 + phase * 2.3) -
      amp * 0.18 * Math.sin(x / 29 + phase * 5.1);
    d += `L${x} ${n(y)}`;
  }
  return d + 'V900Z';
}

const mountains = { far: ridge(625, 95, 0.6), near: ridge(690, 60, 2.4) };

export interface Tower {
  name: string;
  /** Silhouette, running down to the bottom of the view. */
  d: string;
  x: number;
  width: number;
  /** Highest point of the right-hand edge, where the rim light starts. */
  rimTop: number;
  /** Extra path drawn on top (antenna, crown). */
  crown: string;
  /** Lit floors, drawn only at dusk and night. */
  lit: string;
}

/** Lit floor ribbons, `bands` segments per floor, like the towers glimmer at night. */
function floors(x: number, width: number, top: number, seed: number, bands: number, density: number): string {
  const rand = mulberry32(seed);
  const gap = 5;
  const seg = (width - 14 - gap * (bands - 1)) / bands;
  let d = '';
  for (let y = top + 26; y < 800; y += 12) {
    for (let b = 0; b < bands; b++) {
      if (rand() < density) d += `M${n(x + 7 + b * (seg + gap))} ${n(y)}h${n(seg)}v5h${n(-seg)}z`;
    }
  }
  return d;
}

/**
 * Left to right, as seen from the south-east: Torre Cepsa, Torre Emperador
 * (Espacio), Torre de Cristal with its slanted crown, and Torre PwC (Sacyr).
 */
export const towers: Tower[] = [
  {
    name: 'cepsa',
    x: 738,
    width: 92,
    rimTop: 150,
    d: 'M738 900V162H830V900Z',
    crown: 'M752 162V146H816V162ZM781 146V112H787V146Z',
    lit: floors(738, 92, 162, 21, 2, 0.72),
  },
  {
    name: 'espacio',
    x: 860,
    width: 80,
    rimTop: 250,
    d: 'M860 900V250L874 196H926L940 250V900Z',
    crown: 'M894 196V178H906V196ZM899 178V150H901V178Z',
    lit: floors(860, 80, 196, 33, 3, 0.55),
  },
  {
    name: 'cristal',
    x: 974,
    width: 88,
    rimTop: 210,
    d: 'M974 900V270L1062 200V900Z',
    crown: '',
    lit: floors(974, 88, 270, 47, 3, 0.5),
  },
  {
    name: 'sacyr',
    x: 1096,
    width: 88,
    rimTop: 290,
    d: 'M1096 900V300Q1096 262 1134 262H1146Q1184 262 1184 300V900Z',
    crown: '',
    lit: floors(1096, 88, 262, 59, 3, 0.62),
  },
];

/** The green LED wedge that crowns the Torre de Cristal. */
export const cristalLed = 'M974 270L1062 200V214L974 284Z';

const stars = (() => {
  const rand = mulberry32(99);
  return Array.from({ length: 170 }, (_, i) => {
    const y = Math.pow(rand(), 1.6) * 600;
    return {
      x: n(rand() * VIEW.width),
      y: n(y),
      r: n(0.5 + rand() * 1.1),
      twinkle: i % 4 === 0,
      delay: n(rand() * 6),
    };
  });
})();

export const skylineData = {
  mountains,
  back: back.body,
  backWindows: back.lit,
  mid: mid.body,
  midWindows: mid.lit,
  front: front.body,
  stars,
};
