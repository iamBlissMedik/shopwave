import { useQuery } from '@tanstack/react-query';
import { qk, useAuth } from '@shopwave/hooks';
import { api } from '@/api';

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
