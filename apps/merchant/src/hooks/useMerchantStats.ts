'use client';

import { useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

export function useMerchantStats() {
  return useQuery({
    queryKey: qk.merchantStats(),
    queryFn: () => api.merchant.stats(),
  });
}
