import { queryOptions } from '@tanstack/react-query';
import { qk, readPage, readString } from '@shopwave/hooks';
import type { Api, MerchantProductFilters } from '@/api';

/**
 * The merchant dashboard's data contract, shared by Server Components
 * (prefetch) and client hooks (read) — same URL parsing, same query keys, so
 * server-prefetched data hydrates straight into the browser cache.
 */

/** `/products?search=…&page=…` */
export function parseProductFilters(params: URLSearchParams): MerchantProductFilters {
  return { page: readPage(params), limit: 10, search: readString(params, 'search') };
}

/** `/sales?page=…` */
export function parseSalesFilters(params: URLSearchParams) {
  return { page: readPage(params) };
}

export const statsQuery = (api: Api) =>
  queryOptions({ queryKey: qk.merchant.stats(), queryFn: () => api.merchant.stats() });

export const productsQuery = (api: Api, filters: MerchantProductFilters) =>
  queryOptions({
    queryKey: qk.merchant.products(filters),
    queryFn: () => api.merchant.products(filters),
  });

export const productQuery = (api: Api, id: string) =>
  queryOptions({ queryKey: qk.merchant.product(id), queryFn: () => api.merchant.product(id) });

export const salesQuery = (api: Api, page: number) =>
  queryOptions({ queryKey: qk.merchant.sales(page), queryFn: () => api.merchant.sales(page) });
