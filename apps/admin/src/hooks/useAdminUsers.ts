'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api, type AdminUserFilters } from '@/api';

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: qk.adminUsers(filters),
    queryFn: () => api.admin.users(filters),
    placeholderData: keepPreviousData,
  });
}
