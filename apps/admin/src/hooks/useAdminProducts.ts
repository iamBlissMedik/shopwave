'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api, type AdminProductFilters } from '@/api';

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: qk.adminProducts(filters),
    queryFn: () => api.admin.products(filters),
    placeholderData: keepPreviousData,
  });
}
