'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ProductFilters } from '@shopwave/api-client';
import { api } from './client';
import { qk } from './queryKeys';

export type { ProductFilters };

/** Paginated, filtered public catalogue. Filters are part of the cache key. */
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: qk.products(filters),
    queryFn: () => api.products.list(filters),
    // Keep the previous page visible while the next loads (no flicker).
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: qk.product(id),
    queryFn: () => api.products.get(id),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories(),
    queryFn: () => api.products.categories(),
    staleTime: 10 * 60 * 1000,
  });
}
