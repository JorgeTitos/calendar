import { describe, expect, it } from 'vitest';
import { HORIZON_Y, IMAGE, cityPath, project, towers } from './photo';
import { skyAt } from './sky';

const day = { y: 2026, m: 9, d: 30 };

describe('project', () => {
  it('moves the sun left to right and up then down over the day', () => {
    const morning = skyAt(day, 9 * 60).sun;
    const noon = skyAt(day, 14 * 60).sun;
    const evening = skyAt(day, 19 * 60).sun;
    const [a, b, c] = [morning, noon, evening].map((s) => project(s.azimuth, s.elevation));
    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);
    expect(b.y).toBeLessThan(a.y);
    expect(b.y).toBeLessThan(c.y);
  });

  it('puts the sun at the horizon when its elevation is zero', () => {
    expect(project(180, 0).y).toBe(HORIZON_Y);
  });

  it('keeps the noon sun inside the photo', () => {
    const { x, y } = project(skyAt(day, 14 * 60).sun.azimuth, skyAt(day, 14 * 60).sun.elevation);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(IMAGE.width);
    expect(y).toBeGreaterThan(0);
  });
});

describe('skyline geometry', () => {
  it('traces a closed city polygon', () => {
    expect(cityPath.startsWith('M0 ')).toBe(true);
    expect(cityPath.endsWith('Z')).toBe(true);
  });

  it('lists the four towers left to right, inside the photo', () => {
    expect(towers.map((t) => t.name)).toEqual(['espacio', 'cristal', 'pwc', 'cepsa']);
    for (const t of towers) {
      expect(t.x).toBeGreaterThan(0);
      expect(t.x + t.width).toBeLessThan(IMAGE.width);
    }
  });
});
