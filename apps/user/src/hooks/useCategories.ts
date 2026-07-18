'use client';

import { useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

export function useCategories() {
  return useQuery({
    queryKey: qk.categories(),
    queryFn: () => api.products.categories(),
    staleTime: 10 * 60 * 1000,
  });
}
