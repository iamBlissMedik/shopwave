import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, type AdminProductFilters } from '@/api';
import { productsQuery } from '@/queries';

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({ ...productsQuery(api, filters), placeholderData: keepPreviousData });
}
