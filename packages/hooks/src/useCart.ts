'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cart } from '@shopwave/types';
import { api } from './client';
import { notify } from './notify';
import { qk } from './queryKeys';
import { useAuth } from './useAuth';

/**
 * The current server-side cart. Available to guests (anonymous session cookie)
 * and customers, but not merchant/admin accounts. A guest cart merges into the
 * account cart on login/register.
 */
export function useCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.cart(),
    queryFn: () => api.cart.get(),
    enabled: !user || user.role === 'USER',
  });
}

/**
 * All cart mutations share one pattern: call the API, then write the fresh cart
 * the server returns straight into the cache so the navbar badge and cart page
 * update instantly without a refetch.
 */
function useCartMutation<TArgs>(fn: (args: TArgs) => Promise<Cart>, successMsg?: string) {
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

export function useAddToCart() {
  return useCartMutation<{ productId: string; quantity?: number }>(
    (args) => api.cart.addItem(args),
    'Added to cart',
  );
}

export function useUpdateCartItem() {
  return useCartMutation<{ productId: string; quantity: number }>(({ productId, quantity }) =>
    api.cart.updateItem(productId, quantity),
  );
}

export function useRemoveCartItem() {
  return useCartMutation<{ productId: string }>(
    ({ productId }) => api.cart.removeItem(productId),
    'Removed from cart',
  );
}
