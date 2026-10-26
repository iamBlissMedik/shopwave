import { api } from '@/api';
import { useCartMutation } from './useCartMutation';

export function useAddToCart() {
  return useCartMutation<{ productId: string; quantity?: number }>(
    (args) => api.cart.addItem(args),
    'Added to cart',
  );
}
