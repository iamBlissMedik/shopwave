'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Cart } from '@shopwave/types';
import { notify, qk } from '@shopwave/hooks';

/**
 * Shared internal helper for cart mutations. Every cart mutation follows one
 * pattern: call the API, then write the fresh cart the server returns straight
 * into the cache so the navbar badge and cart page update instantly without a
 * refetch. Not exported from the barrel — used only by the cart mutation hooks.
 */
export function useCartMutation<TArgs>(fn: (args: TArgs) => Promise<Cart>, successMsg?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => {
      queryClient.setQueryData(qk.cart(), cart);
      if (successMsg) notify.success(successMsg);
    },
    onError: (error) => notify.error(error),
  });
}
