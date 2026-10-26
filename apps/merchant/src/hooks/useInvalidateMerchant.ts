import { useQueryClient } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';

/**
 * Invalidate every merchant query (stats, product list/detail, sales) after a
 * product change. Shared internal helper — not exported from the barrel; used
 * only by the merchant mutation hooks.
 */
export function useInvalidateMerchant() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: qk.merchant.all() });
}
