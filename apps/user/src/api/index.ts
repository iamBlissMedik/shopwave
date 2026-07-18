// The storefront's own API surface. Built on the shared transport (`http`) from
// @shopwave/hooks, but the endpoint definitions live here so this app owns —
// and only ships — the domains it actually uses: catalogue, cart and orders.
import { http } from '@shopwave/hooks';
import { productEndpoints, type ProductFilters } from './products';
import { cartEndpoints } from './cart';
import { orderEndpoints } from './orders';

export const api = {
  products: productEndpoints(http),
  cart: cartEndpoints(http),
  orders: orderEndpoints(http),
};

export type { ProductFilters };
