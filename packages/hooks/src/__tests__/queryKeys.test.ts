import { describe, it, expect } from 'vitest';
import { qk } from '../queryKeys';

describe('query keys (qk)', () => {
  it('namespaces merchant and admin keys to avoid collisions', () => {
    expect(qk.merchantStats()).toEqual(['merchant', 'stats']);
    expect(qk.adminStats()).toEqual(['admin', 'stats']);
    expect(qk.merchantProducts()[0]).toBe('merchant');
    expect(qk.adminProducts()[0]).toBe('admin');
  });

  it('folds filters into the key so each filter combo caches separately', () => {
    const a = qk.products({ page: 1, category: 'Audio' });
    const b = qk.products({ page: 2, category: 'Audio' });
    expect(a).not.toEqual(b);
    expect(a[0]).toBe('products');
  });

  it('builds stable, distinct keys for entity lookups', () => {
    expect(qk.product('p1')).toEqual(['product', 'p1']);
    expect(qk.product('p1')).toEqual(qk.product('p1'));
    expect(qk.product('p1')).not.toEqual(qk.product('p2'));
  });
});
