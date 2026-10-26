import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notify, qk } from '@shopwave/hooks';
import { api } from '@/api';

/** Place an order from the current cart, then send the user to their orders. */
export function useCheckout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.orders.checkout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.cart() });
      queryClient.invalidateQueries({ queryKey: qk.orders.all() });
      // Stock just changed for everything that was in the cart.
      queryClient.invalidateQueries({ queryKey: qk.products.all() });
      notify.success('Order placed successfully!');
      router.push('/orders');
    },
    onError: (error) => notify.error(error),
  });
}
