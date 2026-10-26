import type { Http } from '@shopwave/api-client';
import { adminEndpoints } from './admin';

/**
 * The admin console's API surface, bound to a transport: the shared browser `http`
 * (`./index`), or a cookie-forwarding transport in Server Components
 * (`./server`) — same endpoints, same types, either side.
 */
export function createApi(http: Http) {
  return { admin: adminEndpoints(http) };
}

export type Api = ReturnType<typeof createApi>;
