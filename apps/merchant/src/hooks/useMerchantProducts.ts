'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api, type MerchantProductFilters } from '@/api';

export function useMerchantProducts(filters: MerchantProductFilters) {
  return useQuery({
    queryKey: qk.merchantProducts(filters),
    queryFn: () => api.merchant.products(filters),
    placeholderData: keepPreviousData,
  });
}
