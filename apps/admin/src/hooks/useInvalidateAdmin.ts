import { useQueryClient } from '@tanstack/react-query';
import { qk } from '@shopwave/hooks';

/**
 * Invalidate every admin query (stats, users, products) after an admin action.
 * Shared internal helper — not exported from the barrel; used only by the admin
 * mutation hooks.
 */
export function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: qk.admin.all() });
}
