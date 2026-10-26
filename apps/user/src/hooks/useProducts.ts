import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, type ProductFilters } from '@/api';
import { productsQuery } from '@/queries';

/** Paginated, filtered public catalogue. Filters are part of the cache key. */
export function useProducts(filters: ProductFilters) {
  return useQuery({
    ...productsQuery(api, filters),
    // Keep the previous page visible (dimmed) while the next loads — no flicker.
    placeholderData: keepPreviousData,
  });
}
