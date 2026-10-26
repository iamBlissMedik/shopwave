import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { qk } from '../queryKeys';

describe('query keys (qk)', () => {
  it('namespaces merchant and admin keys to avoid collisions', () => {
    expect(qk.merchant.stats()).toEqual(['merchant', 'stats']);
    expect(qk.admin.stats()).toEqual(['admin', 'stats']);
    expect(qk.merchant.products({})[0]).toBe('merchant');
    expect(qk.admin.products({})[0]).toBe('admin');
  });

  it('folds filters into the key so each filter combo caches separately', () => {
    const a = qk.products.list({ page: 1, category: 'Audio' });
    const b = qk.products.list({ page: 2, category: 'Audio' });
    expect(a).not.toEqual(b);
    expect(a[0]).toBe('products');
  });

  it('builds stable, distinct keys for entity lookups', () => {
    expect(qk.products.detail('p1')).toEqual(qk.products.detail('p1'));
    expect(qk.products.detail('p1')).not.toEqual(qk.products.detail('p2'));
  });

  it('invalidates a whole domain through its `all()` root', async () => {
    const client = new QueryClient();
    client.setQueryData(qk.orders.list(2), 'page-2');
    client.setQueryData(qk.merchant.sales(1), 'sales');

    await client.invalidateQueries({ queryKey: qk.orders.all() });

    expect(client.getQueryState(qk.orders.list(2))?.isInvalidated).toBe(true);
    expect(client.getQueryState(qk.merchant.sales(1))?.isInvalidated).toBe(false);
  });
});
