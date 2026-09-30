import { describe, expect, it } from 'vitest';
import { buildIcs, fold } from './ics';

describe('buildIcs', () => {
  const ics = buildIcs(
    {
      uid: 'abc@test',
      start: new Date('2026-09-30T16:30:00Z'),
      end: new Date('2026-09-30T17:00:00Z'),
      summary: 'Call, with; Jorge',
    },
    new Date('2026-09-29T08:00:00Z'),
  );

  it('uses UTC stamps and CRLF line endings', () => {
    expect(ics).toContain('DTSTART:20260930T163000Z');
    expect(ics).toContain('DTEND:20260930T170000Z');
    expect(ics.split('\r\n').length).toBeGreaterThan(8);
  });

  it('escapes reserved characters', () => {
    expect(ics).toContain('SUMMARY:Call\\, with\; Jorge');
  });
});

describe('fold', () => {
  it('keeps every physical line within 75 octets', () => {
    const line = 'DESCRIPTION:' + 'ñandú 🦩 '.repeat(40);
    for (const physical of fold(line).split('\r\n')) {
      expect(new TextEncoder().encode(physical).length).toBeLessThanOrEqual(75);
    }
  });

  it('never splits a character and is lossless when unfolded', () => {
    const line = 'SUMMARY:' + '🦩'.repeat(60);
    expect(fold(line).replace(/\r\n /g, '')).toBe(line);
  });
});
