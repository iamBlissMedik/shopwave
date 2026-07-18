'use client';

import { useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

export function useAdminStats() {
  return useQuery({
    queryKey: qk.adminStats(),
    queryFn: () => api.admin.stats(),
  });
}
