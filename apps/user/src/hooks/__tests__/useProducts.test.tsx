import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock this app's API client so the hook resolves without a real network call.
// `vi.hoisted` lets the hoisted vi.mock factory reference `list`.
const list = vi.hoisted(() => vi.fn());
vi.mock('@/api', () => ({ api: { products: { list, get: vi.fn(), categories: vi.fn() } } }));

import { useProducts } from '../useProducts';
import type { ProductFilters } from '@/api';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useProducts', () => {
  it('fetches the catalogue for the given filters and exposes the page', async () => {
    const pageData = { data: [{ id: 'p1', name: 'Aurora' }], meta: { total: 1, page: 1 } };
    list.mockResolvedValue(pageData);
    const filters: ProductFilters = { page: 1, limit: 12, sort: 'newest' };

    const { result } = renderHook(() => useProducts(filters), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(pageData);
    expect(list).toHaveBeenCalledWith(filters);
  });
});
