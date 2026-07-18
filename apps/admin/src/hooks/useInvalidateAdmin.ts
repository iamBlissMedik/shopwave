'use client';

import { useQueryClient } from '@tanstack/react-query';

/**
 * Invalidate everything affected by an admin action. Shared internal helper —
 * not exported from the barrel; used only by the admin mutation hooks.
 */
export function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}
