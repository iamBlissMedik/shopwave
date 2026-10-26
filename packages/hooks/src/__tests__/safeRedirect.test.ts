import { describe, it, expect } from 'vitest';
import { safeRedirect } from '../safeRedirect';

describe('safeRedirect', () => {
  it('keeps same-app relative paths', () => {
    expect(safeRedirect('/cart')).toBe('/cart');
    expect(safeRedirect('/products/abc?tab=1')).toBe('/products/abc?tab=1');
  });

  it('rejects absolute and protocol-relative URLs (open redirect)', () => {
    expect(safeRedirect('https://evil.example')).toBe('/');
    expect(safeRedirect('//evil.example')).toBe('/');
    expect(safeRedirect('/\\evil.example')).toBe('/');
    expect(safeRedirect('javascript:alert(1)')).toBe('/');
  });

  it('rejects control characters the URL parser strips into `//host`', () => {
    expect(safeRedirect('/\t/evil.example')).toBe('/');
    expect(safeRedirect('/\n/evil.example')).toBe('/');
    expect(safeRedirect('/\r/evil.example')).toBe('/');
  });

  it('falls back for empty values and the login page itself', () => {
    expect(safeRedirect(null)).toBe('/');
    expect(safeRedirect('')).toBe('/');
    expect(safeRedirect('/login')).toBe('/');
    expect(safeRedirect('/login?redirect=/x')).toBe('/');
  });
});
