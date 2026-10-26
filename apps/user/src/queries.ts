import { queryOptions } from '@tanstack/react-query';
import { qk, readEnum, readInt, readPage, readString } from '@shopwave/hooks';
import type { Api, ProductFilters } from '@/api';

/**
 * The storefront's data contract, shared by Server Components (prefetch) and
 * client hooks (read). Because both sides parse the URL with the same function
 * and build queries with the same options factory, the query keys match — so
 * server-prefetched data hydrates straight into the browser cache.
 */

export const PRODUCTS_PER_PAGE = 12;
const SORTS = ['newest', 'price_asc', 'price_desc', 'name_asc'] as const;

/** `/?search=…&category=…&sort=…&minPrice=…&maxPrice=…&page=…` → catalogue filters (prices in cents). */
export function parseProductFilters(params: URLSearchParams): ProductFilters {
  return {
    page: readPage(params),
    limit: PRODUCTS_PER_PAGE,
    search: readString(params, 'search'),
    category: readString(params, 'category'),
    minPrice: readInt(params, 'minPrice'),
    maxPrice: readInt(params, 'maxPrice'),
    sort: readEnum(params, 'sort', SORTS, 'newest'),
  };
}

/** `/orders?page=…` */
export function parseOrdersFilters(params: URLSearchParams) {
  return { page: readPage(params) };
}

export const productsQuery = (api: Api, filters: ProductFilters) =>
  queryOptions({
    queryKey: qk.products.list(filters),
    queryFn: () => api.products.list(filters),
  });

export const categoriesQuery = (api: Api) =>
  queryOptions({
    queryKey: qk.products.categories(),
    queryFn: () => api.products.categories(),
    staleTime: 10 * 60 * 1000, // categories rarely change
  });

export const ordersQuery = (api: Api, page: number) =>
  queryOptions({
    queryKey: qk.orders.list(page),
    queryFn: () => api.orders.list(page),
  });
