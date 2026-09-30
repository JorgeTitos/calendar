import { memo, type CSSProperties } from 'react';
import type { Sky } from '../lib/sky';
import { GROUND_Y, VIEW, lampHeads, skylineData as s } from '../lib/skyline';

const sunX = (azimuth: number) => VIEW.width / 2 + (azimuth - 180) * 6.4;
const bodyY = (elevation: number) => 700 - elevation * 9;

const CLOUDS = [
  { x: 300, y: 230, rx: 320, ry: 38, drift: 'a' },
  { x: 930, y: 150, rx: 360, ry: 32, drift: 'b' },
  { x: 1270, y: 350, rx: 300, ry: 30, drift: 'a' },
  { x: 640, y: 420, rx: 260, ry: 26, drift: 'b' },
  { x: 1480, y: 110, rx: 240, ry: 24, drift: 'a' },
] as const;

/** The parts that never change between frames. Colours arrive via CSS variables. */
const Scenery = memo(function Scenery() {
  return (
    <>
      <g className="sky-stars">
        {s.stars.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            className={star.twinkle ? 'star twinkle' : 'star'}
            style={star.twinkle ? { animationDelay: `${star.delay}s` } : undefined}
          />
        ))}
      </g>

      <g className="sky-clouds">
        {CLOUDS.map((c, i) => (
          <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} className={`cloud drift-${c.drift}`} />
        ))}
      </g>
    </>
  );
});

const Skyline = memo(function Skyline() {
  return (
    <>
      <path d={s.far} className="layer-far" />
      <path d={s.cuatroTorres} className="layer-far tower" />

      <path d={s.back} className="layer-back" />
      <path d={s.backWindows} className="windows" />
      <path d={s.metropolis} className="landmark" />
      <path d={s.metropolisWindows} className="windows" />
      <path d={s.mid} className="layer-mid" />
      <path d={s.midWindows} className="windows" />

      <path d={`M0 ${GROUND_Y}H${VIEW.width}V${VIEW.height}H0Z`} className="layer-ground" />
      <path d={s.trees} className="layer-tree" />
      <path d={s.lamps} className="layer-near" />
      {lampHeads.map((l) => (
        <circle key={l.x} cx={l.x} cy={l.y} r="4" className="lamp" />
      ))}
      <path d={s.puertaBody} className="layer-near" fillRule="evenodd" />
      <path d={s.puertaTop} className="layer-near" />
    </>
  );
});

export function MadridSky({ sky }: { sky: Sky }) {
  const { look, sun, moon } = sky;

  const vars = {
    '--sky-top': look.skyTop,
    '--sky-mid': look.skyMid,
    '--sky-horizon': look.skyHorizon,
    '--far': look.far,
    '--mid': look.mid,
    '--near': look.near,
    '--ground': look.ground,
    '--tree': look.tree,
    '--cloud': look.cloud,
    '--sun': look.sun,
    '--sun-glow': look.sunGlow,
    '--stars': look.stars,
    '--windows': look.windows,
    '--lamp': look.windows,
  } as CSSProperties;

  return (
    <div className="sky" style={vars} aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="sky-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="760">
            <stop offset="0" className="stop-top" />
            <stop offset="0.55" className="stop-mid" />
            <stop offset="1" className="stop-horizon" />
          </linearGradient>
          <radialGradient id="sun-glow">
            <stop offset="0" className="stop-glow" stopOpacity="0.95" />
            <stop offset="0.35" className="stop-glow" stopOpacity="0.35" />
            <stop offset="1" className="stop-glow" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moon-glow">
            <stop offset="0" stopColor="#dfe8ff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#dfe8ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cloud-gradient">
            <stop offset="0" className="stop-cloud" stopOpacity="0.6" />
            <stop offset="1" className="stop-cloud" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={VIEW.width} height={VIEW.height} fill="url(#sky-gradient)" />

        <Scenery />

        <g opacity={sun.opacity * look.sunGlowOpacity}>
          <circle cx={sunX(sun.azimuth)} cy={bodyY(sun.elevation)} r="560" fill="url(#sun-glow)" />
        </g>
        <circle
          cx={sunX(sun.azimuth)}
          cy={bodyY(sun.elevation)}
          r="34"
          className="sun-disc"
          opacity={sun.opacity}
        />

        <g opacity={moon.opacity}>
          <circle cx={sunX(moon.azimuth)} cy={bodyY(moon.elevation)} r="130" fill="url(#moon-glow)" />
          <circle cx={sunX(moon.azimuth)} cy={bodyY(moon.elevation)} r="24" fill="#f4f1e4" />
          <circle cx={sunX(moon.azimuth) - 7} cy={bodyY(moon.elevation) - 5} r="4.5" fill="#dcd8c6" />
          <circle cx={sunX(moon.azimuth) + 8} cy={bodyY(moon.elevation) + 7} r="3.2" fill="#dcd8c6" />
        </g>

        <Skyline />
      </svg>
      <div className="sky-scrim" />
    </div>
  );
}
