'use client';

import { useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

export function useProduct(id: string) {
  return useQuery({
    queryKey: qk.product(id),
    queryFn: () => api.products.get(id),
    enabled: Boolean(id),
  });
}
