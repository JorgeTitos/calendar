import { memo, type CSSProperties } from 'react';
import photo from '../assets/madrid-cuatro-torres.jpg';
import { HORIZON_Y, IMAGE, cityPath, lights, project, stars, towers } from '../lib/photo';
import type { Sky } from '../lib/sky';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Every layer lives in the photo's own coordinate system inside one `.stage`, so they stay aligned. */
const svgProps = {
  viewBox: `0 0 ${IMAGE.width} ${IMAGE.height}`,
  focusable: false,
} as const;

const Stars = memo(function Stars() {
  return (
    <g className="stars">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          className={s.twinkle ? 'star twinkle' : 'star'}
          style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
        />
      ))}
    </g>
  );
});

const Lights = memo(function Lights() {
  return (
    <>
      <clipPath id="tower-clip">
        {towers.map((t) => (
          <path key={t.name} d={t.d} />
        ))}
      </clipPath>
      <g className="lights">
        <path d={lights.blocks} className="lights-blocks" />
        <g clipPath="url(#tower-clip)">
          <path d={lights.towers} className="lights-towers" />
        </g>
      </g>
    </>
  );
});

/**
 * A real photograph of Madrid's Cuatro Torres, lit by the sun's actual position.
 * Layers, bottom to top: the photo (exposure/saturation filter) → a colour cast
 * multiplied over it → lit windows → sun, moon and stars, which are masked by
 * the skyline so they set *behind* the real buildings.
 */
export function PhotoSky({ sky }: { sky: Sky }) {
  const { look, sun, moon } = sky;
  const sunPos = project(sun.azimuth, sun.elevation);
  const moonPos = project(moon.azimuth, moon.elevation);

  // Near the horizon the sun is bigger, sharper and redder.
  const low = clamp01(1 - sun.elevation / 25);
  const sunRadius = 22 + low * 26;
  const discOpacity = sun.opacity;

  const vars = {
    '--exposure': look.exposure,
    '--saturation': look.saturation,
    '--stars': look.stars,
    '--windows': look.windows,
  } as CSSProperties;

  return (
    <div className="sky" style={vars} aria-hidden="true">
      <div className="stage">
      <img className="photo" src={photo} alt="" decoding="async" fetchPriority="high" />

      <svg className="layer multiply" {...svgProps}>
        <defs>
          <linearGradient id="tint" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={HORIZON_Y}>
            <stop offset="0" stopColor={look.tintTop} />
            <stop offset="1" stopColor={look.tintHorizon} />
          </linearGradient>
        </defs>
        <rect width={IMAGE.width} height={IMAGE.height} fill="url(#tint)" opacity={look.grade} />
      </svg>

      <svg className="layer screen lit" {...svgProps}>
        <Lights />
      </svg>

      <svg className="layer screen" {...svgProps}>
        <defs>
          <mask id="sky-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={IMAGE.width} height={IMAGE.height}>
            <rect width={IMAGE.width} height={IMAGE.height} fill="#fff" />
            <path d={cityPath} fill="#000" />
            {towers.map((t) => (
              <path key={t.name} d={t.d} fill="#000" />
            ))}
          </mask>
          <radialGradient id="sun-glow">
            <stop offset="0" stopColor={look.sunGlow} stopOpacity="0.9" />
            <stop offset="0.3" stopColor={look.sunGlow} stopOpacity="0.35" />
            <stop offset="1" stopColor={look.sunGlow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sun-core">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.3" stopColor="#fff" />
            <stop offset="0.55" stopColor={look.sun} stopOpacity="0.9" />
            <stop offset="1" stopColor={look.sun} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moon-glow">
            <stop offset="0" stopColor="#dfe8ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#dfe8ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g mask="url(#sky-mask)">
          <g style={{ opacity: 'var(--stars)' }}>
            <Stars />
          </g>

          <g opacity={sun.opacity * look.sunGlowOpacity}>
            <circle cx={sunPos.x} cy={sunPos.y} r="950" fill="url(#sun-glow)" />
          </g>
          <circle cx={sunPos.x} cy={sunPos.y} r={sunRadius * 2.2} fill="url(#sun-core)" opacity={discOpacity} />

          <g opacity={moon.opacity}>
            <circle cx={moonPos.x} cy={moonPos.y} r="210" fill="url(#moon-glow)" />
            <circle cx={moonPos.x} cy={moonPos.y} r="34" fill="#f4f1e4" />
            <circle cx={moonPos.x - 10} cy={moonPos.y - 7} r="6" fill="#d9d5c2" />
            <circle cx={moonPos.x + 11} cy={moonPos.y + 10} r="4.5" fill="#d9d5c2" />
            <circle cx={moonPos.x + 6} cy={moonPos.y - 14} r="3" fill="#d9d5c2" />
          </g>
        </g>
      </svg>
      </div>

      <div className="sky-scrim" />
      <a
        className="credit"
        href="https://commons.wikimedia.org/wiki/File:Torres_de_Madrid.JPG"
        target="_blank"
        rel="noreferrer"
      >
        Photo: Archivaldo · Wikimedia Commons · public domain
      </a>
    </div>
  );
}
