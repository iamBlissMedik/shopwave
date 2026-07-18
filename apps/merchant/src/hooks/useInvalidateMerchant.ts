'use client';

import { useQueryClient } from '@tanstack/react-query';

/**
 * Invalidate everything affected by a product change. Shared internal helper —
 * not exported from the barrel; used only by the merchant mutation hooks.
 */
export function useInvalidateMerchant() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['merchant'] });
    queryClient.invalidateQueries({ queryKey: ['products'] }); // public catalogue
  };
}
