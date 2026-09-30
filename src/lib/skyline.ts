/**
 * Procedural Madrid skyline, drawn in a 1600×900 viewBox.
 * Everything is deterministic (seeded), so the picture is identical on every load
 * and nothing is fetched: no photos, no licences, just SVG paths.
 */

export const VIEW = { width: 1600, height: 900 } as const;

/** Where the ground starts (the foreground meadow / plaza). */
export const GROUND_Y = 862;

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

/** Path for a row of buildings of varying height; also returns lit windows. */
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
      const rows = Math.floor((860 - top - 14) / 17);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() < 0.42) lit += `M${n(x + 7 + c * 12)} ${n(top + 14 + r * 17)}h5v8h-5z`;
        }
      }
    }
    x += w - opts.overlap + rand() * 4;
  }
  return { body, lit };
}

const farRow = buildRow({ seed: 11, from: -20, to: 1640, width: [30, 70], top: [636, 690], overlap: 4, windows: false });
const backRow = buildRow({ seed: 5, from: -40, to: 1640, width: [50, 96], top: [590, 690], overlap: 8, windows: true });
const midRow = buildRow({ seed: 7, from: -30, to: 1640, width: [54, 110], top: [670, 770], overlap: 6, windows: true });

/** Cuatro Torres Business Area — the four glass towers north of the centre. */
const cuatroTorres = [
  // Torre Cepsa
  'M1236 720V318L1246 296H1266L1276 318V720Z',
  // Torre de Cristal (chamfered crown)
  'M1298 720V282L1310 254H1336L1348 282V720Z',
  // Torre Sacyr
  'M1362 720V330L1372 306H1392L1402 330V720Z',
  // Torre PwC / Espacio (tapered top)
  'M1416 720V312L1426 288H1446L1458 312V720Z',
].join('');

/** Edificio Metrópolis: stepped tower, drum, dome and the winged Victory. */
const METROPOLIS_X = 740;
const metropolis = (() => {
  const x = METROPOLIS_X;
  return [
    // base and cornice
    `M${x} 900V590H${x + 150}V900Z`,
    `M${x - 6} 584H${x + 156}V596H${x - 6}Z`,
    // second tier
    `M${x + 20} 584V528H${x + 130}V584Z`,
    `M${x + 15} 522H${x + 135}V532H${x + 15}Z`,
    // drum
    `M${x + 42} 522V488H${x + 108}V522Z`,
    // dome
    `M${x + 46} 488C${x + 46} 450 ${x + 104} 450 ${x + 104} 488Z`,
    // lantern & statue
    `M${x + 71} 458h8v-22h-8z`,
    `M${x + 66} 436h18l-5-12h-8z`,
    `M${x + 75} 424m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0`,
  ].join('');
})();

const metropolisWindows = (() => {
  const x = METROPOLIS_X;
  let d = '';
  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r * 7 + c * 3) % 5 < 3) d += `M${x + 12 + c * 17} ${610 + r * 19}h6v10h-6z`;
    }
  }
  return d;
})();

/**
 * Puerta de Alcalá, the neoclassical gate: five openings, a cornice,
 * an attic and a pediment. Openings are cut with `fill-rule: evenodd`.
 */
const PUERTA_X = 1010;
const puertaBody = (() => {
  const x = PUERTA_X;
  const g = GROUND_Y;
  const centre = x + 100;
  const arch = (cx: number, halfWidth: number, top: number) =>
    `M${cx - halfWidth} ${g}V${top + halfWidth}A${halfWidth} ${halfWidth} 0 0 1 ${cx + halfWidth} ${top + halfWidth}V${g}Z`;
  const door = (cx: number) => `M${cx - 7} ${g}V${g - 44}h14V${g}Z`;
  return [
    `M${x} ${g}V742H${x + 200}V${g}Z`, // body
    arch(centre, 21, 770), // central arch
    arch(centre - 46, 13, 800), // inner side arches
    arch(centre + 46, 13, 800),
    door(x + 22), // outer rectangular openings
    door(x + 178),
  ].join('');
})();

const puertaTop = (() => {
  const x = PUERTA_X;
  return [
    `M${x - 10} 742V728H${x + 210}V742Z`, // cornice
    `M${x + 24} 728V696H${x + 176}V728Z`, // attic
    `M${x + 66} 696L${x + 100} 664L${x + 134} 696Z`, // pediment
    `M${x + 34} 696h9v-9h-9zM${x + 157} 696h9v-9h-9z`, // corner sculptures
    `M${x + 96} 664h8v-8h-8z`,
  ].join('');
})();

/** Rounded tree crowns, each a stack of circles on a trunk. */
const trees = (() => {
  const rand = mulberry32(31);
  const at = [
    [930, 46], [975, 38], [1255, 44], [1305, 54], [1360, 40], [1415, 48], [1470, 42], [1540, 50],
    [40, 44], [120, 52], [210, 40], [300, 48], [400, 42], [500, 50], [610, 44], [690, 38],
  ];
  let d = '';
  for (const [cx, r] of at) {
    const cy = GROUND_Y - r - 14;
    d += `M${cx - 3} ${GROUND_Y}V${cy}h6V${GROUND_Y}Z`;
    for (let i = 0; i < 4; i++) {
      const ox = (rand() - 0.5) * r * 0.9;
      const oy = (rand() - 0.5) * r * 0.5;
      const rr = r * (0.55 + rand() * 0.3);
      d += `M${n(cx + ox - rr)} ${n(cy + oy)}a${n(rr)} ${n(rr)} 0 1 0 ${n(rr * 2)} 0a${n(rr)} ${n(rr)} 0 1 0 ${n(-rr * 2)} 0`;
    }
  }
  return d;
})();

/** Street lamps flanking the gate. */
const lamps = [970, 1235].map((x) => `M${x} ${GROUND_Y}V${GROUND_Y - 90}h3V${GROUND_Y}Z`).join('');
export const lampHeads = [970, 1235].map((x) => ({ x: x + 1.5, y: GROUND_Y - 92 }));

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
  far: farRow.body,
  cuatroTorres,
  back: backRow.body,
  backWindows: backRow.lit,
  mid: midRow.body,
  midWindows: midRow.lit,
  metropolis,
  metropolisWindows,
  puertaBody,
  puertaTop,
  trees,
  lamps,
  stars,
};
