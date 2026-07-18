import type { Cart } from '@shopwave/types';
import type { Http } from '@shopwave/api-client';

/** Customer cart endpoints. Every mutation returns the fresh cart. */
export function cartEndpoints(http: Http) {
  return {
    get: () => http.get<{ cart: Cart }>('/cart').then((d) => d.cart),
    addItem: (args: { productId: string; quantity?: number }) =>
      http.post<{ cart: Cart }>('/cart/items', args).then((d) => d.cart),
    updateItem: (productId: string, quantity: number) =>
      http.patch<{ cart: Cart }>(`/cart/items/${productId}`, { quantity }).then((d) => d.cart),
    removeItem: (productId: string) =>
      http.delete<{ cart: Cart }>(`/cart/items/${productId}`).then((d) => d.cart),
  };
}
