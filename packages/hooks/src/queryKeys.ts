/**
 * Centralized React Query key factory.
 *
 * Every cache key in the platform is defined here, so:
 *  - keys never drift or collide between hooks,
 *  - each domain has an `all()` root, and every other key in that domain starts
 *    with it — so `invalidateQueries({ queryKey: qk.merchant.all() })` refreshes
 *    the whole domain by prefix match,
 *  - a filter object is part of the key, so each filter combo caches separately.
 */
export const qk = {
  me: () => ['me'] as const,

  // storefront
  products: {
    all: () => ['products'] as const,
    list: (filters: object) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    categories: () => ['products', 'categories'] as const,
  },
  cart: () => ['cart'] as const,
  orders: {
    all: () => ['orders'] as const,
    list: (page: number) => ['orders', 'list', page] as const,
  },

  // merchant dashboard
  merchant: {
    all: () => ['merchant'] as const,
    stats: () => ['merchant', 'stats'] as const,
    products: (filters: object) => ['merchant', 'products', filters] as const,
    product: (id: string) => ['merchant', 'product', id] as const,
    sales: (page: number) => ['merchant', 'sales', page] as const,
  },

  // admin console
  admin: {
    all: () => ['admin'] as const,
    stats: () => ['admin', 'stats'] as const,
    users: (filters: object) => ['admin', 'users', filters] as const,
    products: (filters: object) => ['admin', 'products', filters] as const,
  },
};
