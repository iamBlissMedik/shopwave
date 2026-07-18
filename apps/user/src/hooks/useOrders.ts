'use client';

import { useQuery } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';
import { api } from '@/api';

export function useOrders(page = 1) {
  return useQuery({
    queryKey: qk.orders(page),
    queryFn: () => api.orders.list(page),
  });
}
