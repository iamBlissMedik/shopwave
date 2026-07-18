'use client';

import { useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

/** A single owned product, for the edit form. */
export function useMerchantProduct(id: string) {
  return useQuery({
    queryKey: qk.merchantProduct(id),
    queryFn: () => api.merchant.product(id),
    enabled: Boolean(id),
  });
}
