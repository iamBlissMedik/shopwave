import type { Http } from '@shopwave/api-client';
import { productEndpoints } from './products';
import { cartEndpoints } from './cart';
import { orderEndpoints } from './orders';

/**
 * The storefront's API surface, bound to a transport: the shared browser `http`
 * (`./index`), or a cookie-forwarding transport in Server Components
 * (`./server`) — same endpoints, same types, either side.
 */
export function createApi(http: Http) {
  return {
    products: productEndpoints(http),
    cart: cartEndpoints(http),
    orders: orderEndpoints(http),
  };
}

export type Api = ReturnType<typeof createApi>;
