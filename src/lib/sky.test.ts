import { describe, expect, it } from 'vitest';
import { lookForElevation, skyAt } from './sky';

const day = { y: 2026, m: 9, d: 30 };

describe('skyAt (Madrid, 30 Sep 2026)', () => {
  it('peaks near 47° at solar noon (~14:05 CEST)', () => {
    const { sunElevation } = skyAt(day, 14 * 60 + 5);
    expect(sunElevation).toBeGreaterThan(45);
    expect(sunElevation).toBeLessThan(49);
  });

  it('is well below the horizon at midnight', () => {
    expect(skyAt(day, 0).sunElevation).toBeLessThan(-30);
  });

  it('sets in the west and rises in the east', () => {
    expect(skyAt(day, 8 * 60 + 30).sun.azimuth).toBeLessThan(120);
    expect(skyAt(day, 19 * 60 + 30).sun.azimuth).toBeGreaterThan(240);
  });

  it('is night at 3am and daytime at 1pm', () => {
    expect(skyAt(day, 3 * 60).look.stars).toBe(1);
    expect(skyAt(day, 13 * 60).look.stars).toBe(0);
  });

  it('shows the sun by day and the moon by night, never both fully', () => {
    const noon = skyAt(day, 13 * 60);
    const night = skyAt(day, 2 * 60);
    expect(noon.sun.opacity).toBe(1);
    expect(noon.moon.opacity).toBe(0);
    expect(night.sun.opacity).toBe(0);
    expect(night.moon.opacity).toBe(1);
  });
});

describe('lookForElevation', () => {
  it('clamps outside the keyframe range', () => {
    expect(lookForElevation(-90)).toEqual(lookForElevation(-40));
    expect(lookForElevation(90)).toEqual(lookForElevation(60));
  });

  it('blends smoothly between keyframes', () => {
    const a = lookForElevation(-6).windows;
    const b = lookForElevation(-3).windows;
    const c = lookForElevation(-1).windows;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });
});
