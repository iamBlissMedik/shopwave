'use client';

import { api } from '@/api';
import { useCartMutation } from './useCartMutation';

export function useUpdateCartItem() {
  return useCartMutation<{ productId: string; quantity: number }>(({ productId, quantity }) =>
    api.cart.updateItem(productId, quantity),
  );
}
