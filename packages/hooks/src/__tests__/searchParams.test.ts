import { describe, it, expect } from 'vitest';
import { readEnum, readInt, readPage, readString, toURLSearchParams } from '../searchParams';

const params = (query: string) => new URLSearchParams(query);

describe('searchParams helpers', () => {
  it('converts a page `searchParams` record, keeping the first of repeated keys', () => {
    const sp = toURLSearchParams({ page: '2', tag: ['a', 'b'], missing: undefined });
    expect(sp.toString()).toBe('page=2&tag=a');
  });

  it('reads trimmed non-empty strings', () => {
    expect(readString(params('q=%20mouse%20'), 'q')).toBe('mouse');
    expect(readString(params('q=%20%20'), 'q')).toBeUndefined();
    expect(readString(params(''), 'q')).toBeUndefined();
  });

  it('reads non-negative integers and rejects junk', () => {
    expect(readInt(params('n=42'), 'n')).toBe(42);
    expect(readInt(params('n=-1'), 'n', 7)).toBe(7);
    expect(readInt(params('n=1.5'), 'n')).toBeUndefined();
    expect(readInt(params('n=abc'), 'n', 0)).toBe(0);
  });

  it('reads a 1-based page, defaulting to 1', () => {
    expect(readPage(params('page=3'))).toBe(3);
    expect(readPage(params('page=0'))).toBe(1);
    expect(readPage(params(''))).toBe(1);
  });

  it('only accepts allowed enum values', () => {
    const sorts = ['newest', 'price_asc'] as const;
    expect(readEnum(params('sort=price_asc'), 'sort', sorts, 'newest')).toBe('price_asc');
    expect(readEnum(params('sort=DROP'), 'sort', sorts, 'newest')).toBe('newest');
  });
});
