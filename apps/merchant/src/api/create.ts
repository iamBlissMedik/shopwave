import type { Http } from '@shopwave/api-client';
import { merchantEndpoints } from './merchant';

/**
 * The merchant dashboard's API surface, bound to a transport: the shared browser `http`
 * (`./index`), or a cookie-forwarding transport in Server Components
 * (`./server`) — same endpoints, same types, either side.
 */
export function createApi(http: Http) {
  return { merchant: merchantEndpoints(http) };
}

export type Api = ReturnType<typeof createApi>;
