import type { Http } from '../client';
import { authEndpoints } from './auth';
import { productEndpoints } from './products';
import { cartEndpoints } from './cart';
import { orderEndpoints } from './orders';
import { merchantEndpoints } from './merchant';
import { adminEndpoints } from './admin';

/**
 * Build the full typed endpoint surface from an `http` helper.
 * `endpoints.products.list(filters)`, `endpoints.cart.addItem(...)`, etc.
 */
export function createEndpoints(http: Http) {
  return {
    auth: authEndpoints(http),
    products: productEndpoints(http),
    cart: cartEndpoints(http),
    orders: orderEndpoints(http),
    merchant: merchantEndpoints(http),
    admin: adminEndpoints(http),
  };
}

export type Endpoints = ReturnType<typeof createEndpoints>;

export * from './auth';
export * from './products';
export * from './cart';
export * from './orders';
export * from './merchant';
export * from './admin';
