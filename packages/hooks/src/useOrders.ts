'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from './client';
import { notify } from './notify';
import { qk } from './queryKeys';

export function useOrders(page = 1) {
  return useQuery({
    queryKey: qk.orders(page),
    queryFn: () => api.orders.list(page),
  });
}

/** Place an order from the current cart, then send the user to their orders. */
export function useCheckout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.orders.checkout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.cart() });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notify.success('Order placed successfully!');
      router.push('/orders');
    },
    onError: (error) => notify.error(error),
  });
}
