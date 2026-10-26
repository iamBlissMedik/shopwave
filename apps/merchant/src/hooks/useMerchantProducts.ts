import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, type MerchantProductFilters } from '@/api';
import { productsQuery } from '@/queries';

export function useMerchantProducts(filters: MerchantProductFilters) {
  return useQuery({ ...productsQuery(api, filters), placeholderData: keepPreviousData });
}
