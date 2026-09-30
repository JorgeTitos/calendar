/**
 * Geometry for the real photograph (`assets/madrid-cuatro-torres.jpg`), measured
 * in the photo's own pixels. The overlay layers (sun, stars, lit windows…) are
 * drawn in this same coordinate system, so they stay glued to the picture at any
 * screen size.
 */

export const IMAGE = { width: 2400, height: 1241 } as const;

/** Approximate y of the horizon behind the towers. */
export const HORIZON_Y = 892;

const n = (v: number) => Math.round(v * 10) / 10;

/**
 * The city's upper edge, hand-traced from the photo: apartment blocks on the
 * left, low buildings between the towers. Everything below is "city".
 * Used to hide the sun, moon and stars behind the real skyline.
 */
const EDGE: Array<[number, number]> = [
  [0, 840], [55, 838], [55, 832], [135, 832], [135, 840], [265, 840], [265, 850], [305, 852],
  [375, 855], [375, 848], [525, 848], [525, 857], [600, 855], [730, 850], [730, 875], [780, 878],
  [780, 850], [835, 850], [835, 825], [850, 800], [852, 825], [895, 825], [895, 838], [940, 838],
  [940, 890], [1030, 890], [1030, 872], [1070, 870], [1160, 880], [1160, 900],
  // Torre de Cristal and its neighbour are traced as towers below.
  [1375, 900], [1375, 870], [1420, 870], [1420, 865], [1490, 865], [1490, 868], [1550, 865],
  [1550, 900], [1652, 900], [1655, 865], [1730, 865], [1730, 875], [1770, 875], [1770, 900],
  [1896, 900], [1896, 850], [1920, 850], [1920, 890], [1975, 890], [1975, 850], [2140, 850],
  [2140, 840], [2200, 840], [2200, 890], [2265, 890], [2265, 850], [2330, 850], [2330, 860],
  [2400, 860],
];

export const cityPath =
  'M' + EDGE.map(([x, y]) => `${x} ${y}`).join('L') + `L${IMAGE.width} ${IMAGE.height}L0 ${IMAGE.height}Z`;

export interface Tower {
  name: string;
  d: string;
  x: number;
  width: number;
  top: number;
  bottom: number;
  bands: number;
  density: number;
}

/** From left to right: Torre de Cristal, Torre Espacio, Torre PwC and Torre Cepsa. */
export const towers: Tower[] = [
  { name: 'espacio', d: 'M1172 482H1233L1235 650L1260 770L1258 900H1140L1155 720L1175 580Z', x: 1140, width: 120, top: 482, bottom: 900, bands: 3, density: 0.5 },
  { name: 'cristal', d: 'M1258 900L1278 463L1350 422L1362 442L1373 900Z', x: 1260, width: 112, top: 440, bottom: 900, bands: 3, density: 0.55 },
  { name: 'pwc', d: 'M1547 900V432L1553 425H1646L1652 432V900Z', x: 1547, width: 105, top: 432, bottom: 900, bands: 3, density: 0.6 },
  { name: 'cepsa', d: 'M1772 905V385H1896V905Z', x: 1772, width: 124, top: 385, bottom: 905, bands: 4, density: 0.62 },
];

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lit floor ribbons for a tower. Clipped to the tower's silhouette when drawn. */
function towerLights(t: Tower, seed: number): string {
  const rand = mulberry32(seed);
  const gap = 5;
  const seg = (t.width - 14 - gap * (t.bands - 1)) / t.bands;
  let d = '';
  for (let y = t.top + 34; y < t.bottom - 20; y += 15) {
    for (let b = 0; b < t.bands; b++) {
      if (rand() < t.density) d += `M${n(t.x + 7 + b * (seg + gap))} ${n(y)}h${n(seg)}v4h${n(-seg)}z`;
    }
  }
  return d;
}

/** A sprinkle of lit windows on the apartment blocks. */
function blockLights(): string {
  const rand = mulberry32(77);
  const zones = [
    { x0: 0, x1: 470, y0: 940, y1: 1085, pitch: [14, 22] as const },
    { x0: 0, x1: 1130, y0: 850, y1: 935, pitch: [13, 16] as const },
    { x0: 1975, x1: 2140, y0: 862, y1: 895, pitch: [12, 14] as const },
  ];
  let d = '';
  for (const z of zones) {
    for (let y = z.y0; y < z.y1; y += z.pitch[1]) {
      for (let x = z.x0; x < z.x1; x += z.pitch[0]) {
        if (rand() < 0.22) d += `M${n(x + rand() * 3)} ${n(y)}h5v7h-5z`;
      }
    }
  }
  return d;
}

export const lights = {
  towers: towers.map((t, i) => towerLights(t, 21 + i * 13)).join(''),
  blocks: blockLights(),
};

export const stars = (() => {
  const rand = mulberry32(99);
  return Array.from({ length: 150 }, (_, i) => ({
    x: n(rand() * IMAGE.width),
    y: n(Math.pow(rand(), 1.4) * 820),
    r: n(0.8 + rand() * 1.4),
    twinkle: i % 4 === 0,
    delay: n(rand() * 6),
  }));
})();

/**
 * Maps sun/moon azimuth (deg) and elevation (deg) onto photo pixels. The arc is
 * squeezed toward the right of the frame so it stays visible beside the card.
 */
export const project = (azimuth: number, elevation: number) => ({
  x: 1600 + (azimuth - 180) * 4.6,
  y: HORIZON_Y - elevation * 13.5,
});
