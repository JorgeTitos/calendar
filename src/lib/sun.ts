/**
 * Low-precision solar position (Astronomical Almanac approximation).
 * Accurate to well under a degree, which is plenty to paint a sky.
 */

export interface SunPosition {
  /** Degrees above the horizon (negative = below). */
  elevation: number;
  /** Degrees clockwise from north. */
  azimuth: number;
}

const RAD = Math.PI / 180;
const norm = (deg: number, mod: number) => ((deg % mod) + mod) % mod;

export function solarPosition(instant: Date, latitude: number, longitude: number): SunPosition {
  const jd = instant.getTime() / 86_400_000 + 2_440_587.5;
  const n = jd - 2_451_545.0;

  const meanLon = norm(280.46 + 0.9856474 * n, 360);
  const anomaly = norm(357.528 + 0.9856003 * n, 360);
  const eclipticLon =
    meanLon + 1.915 * Math.sin(anomaly * RAD) + 0.02 * Math.sin(2 * anomaly * RAD);
  const obliquity = 23.439 - 0.0000004 * n;

  const ra =
    Math.atan2(
      Math.cos(obliquity * RAD) * Math.sin(eclipticLon * RAD),
      Math.cos(eclipticLon * RAD),
    ) / RAD;
  const dec = Math.asin(Math.sin(obliquity * RAD) * Math.sin(eclipticLon * RAD));

  const gmst = norm(280.46061837 + 360.98564736629 * n, 360);
  const hourAngle = (gmst + longitude - ra) * RAD;
  const lat = latitude * RAD;

  const elevation = Math.asin(
    Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle),
  );
  const azimuth = Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat),
  );

  return { elevation: elevation / RAD, azimuth: norm(azimuth / RAD + 180, 360) };
}
