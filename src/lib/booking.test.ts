import { describe, expect, it } from 'vitest';
import { resolveEndpoint } from './booking';

describe('resolveEndpoint', () => {
  it('is null in demo mode', () => {
    expect(resolveEndpoint(undefined)).toBeNull();
    expect(resolveEndpoint('')).toBeNull();
  });

  it('accepts https and local http', () => {
    expect(resolveEndpoint('https://example.com/hook')).toBe('https://example.com/hook');
    expect(resolveEndpoint('http://localhost:8787/book')).toBe('http://localhost:8787/book');
  });

  it('rejects plain http on the internet, other schemes and garbage', () => {
    expect(() => resolveEndpoint('http://example.com/hook')).toThrow();
    expect(() => resolveEndpoint('javascript:alert(1)')).toThrow();
    expect(() => resolveEndpoint('not a url')).toThrow();
  });
});
