import type { Order, Paginated } from '@shopwave/types';
import type { Http } from '../client';

/** Customer order endpoints. */
export function orderEndpoints(http: Http) {
  return {
    list: (page = 1) => http.get<Paginated<Order>>('/orders', { page }),
    checkout: () => http.post<{ order: Order }>('/orders/checkout').then((d) => d.order),
  };
}
