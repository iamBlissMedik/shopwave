import { queryOptions } from '@tanstack/react-query';
import type { Role } from '@shopwave/types';
import { qk, readEnum, readPage, readString } from '@shopwave/hooks';
import type { AdminProductFilters, AdminUserFilters, Api } from '@/api';

/**
 * The admin console's data contract, shared by Server Components (prefetch)
 * and client hooks (read) — same URL parsing, same query keys, so
 * server-prefetched data hydrates straight into the browser cache.
 */

export const ROLES: readonly Role[] = ['USER', 'MERCHANT', 'ADMIN'];
const STATUSES = ['active', 'inactive'] as const;

/** `/users?search=…&role=…&page=…` */
export function parseUserFilters(params: URLSearchParams): AdminUserFilters {
  return {
    page: readPage(params),
    limit: 10,
    search: readString(params, 'search'),
    role: readEnum(params, 'role', ROLES),
  };
}

/** `/products?search=…&status=…&page=…` */
export function parseProductFilters(params: URLSearchParams): AdminProductFilters {
  return {
    page: readPage(params),
    limit: 10,
    search: readString(params, 'search'),
    status: readEnum(params, 'status', STATUSES),
  };
}

export const statsQuery = (api: Api) =>
  queryOptions({ queryKey: qk.admin.stats(), queryFn: () => api.admin.stats() });

export const usersQuery = (api: Api, filters: AdminUserFilters) =>
  queryOptions({ queryKey: qk.admin.users(filters), queryFn: () => api.admin.users(filters) });

export const productsQuery = (api: Api, filters: AdminProductFilters) =>
  queryOptions({
    queryKey: qk.admin.products(filters),
    queryFn: () => api.admin.products(filters),
  });
