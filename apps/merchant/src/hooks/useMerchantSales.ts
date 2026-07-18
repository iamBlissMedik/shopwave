'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

export function useMerchantSales(page = 1) {
  return useQuery({
    queryKey: qk.merchantSales(page),
    queryFn: () => api.merchant.sales(page),
    placeholderData: keepPreviousData,
  });
}
