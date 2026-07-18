'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api, type ProductFilters } from '@/api';

/** Paginated, filtered public catalogue. Filters are part of the cache key. */
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: qk.products(filters),
    queryFn: () => api.products.list(filters),
    // Keep the previous page visible while the next loads (no flicker).
    placeholderData: keepPreviousData,
  });
}
