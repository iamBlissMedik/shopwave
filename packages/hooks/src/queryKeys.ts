/**
 * Centralized React Query key factory.
 *
 * Every cache key in the platform is defined here, so:
 *  - keys never drift or collide between hooks,
 *  - invalidation is precise (`queryClient.invalidateQueries({ queryKey: qk.cart() })`),
 *  - a filter object is part of the key, so each filter combo caches separately.
 */
export const qk = {
  me: () => ['me'] as const,

  products: (filters?: unknown) => ['products', filters] as const,
  product: (id: string) => ['product', id] as const,
  categories: () => ['categories'] as const,

  cart: () => ['cart'] as const,
  orders: (page?: number) => ['orders', page] as const,

  // merchant dashboard
  merchantStats: () => ['merchant', 'stats'] as const,
  merchantProducts: (filters?: unknown) => ['merchant', 'products', filters] as const,
  merchantProduct: (id: string) => ['merchant', 'product', id] as const,
  merchantSales: (page?: number) => ['merchant', 'sales', page] as const,

  // admin console
  adminStats: () => ['admin', 'stats'] as const,
  adminUsers: (filters?: unknown) => ['admin', 'users', filters] as const,
  adminProducts: (filters?: unknown) => ['admin', 'products', filters] as const,
};
