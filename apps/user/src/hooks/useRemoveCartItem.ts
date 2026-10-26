import { api } from '@/api';
import { useCartMutation } from './useCartMutation';

export function useRemoveCartItem() {
  return useCartMutation<{ productId: string }>(
    ({ productId }) => api.cart.removeItem(productId),
    'Removed from cart',
  );
}
