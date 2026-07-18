// Public surface of @shopwave/api-client.
//
// This package is deliberately thin: it owns the *transport* (the configured
// axios instance, the typed `http` helpers and error normalization) plus the
// one endpoint group that is shared by every app — `auth`. Each app builds and
// owns its own domain endpoints (products, cart, orders, merchant, admin) on
// top of this transport, so the storefront never ships merchant/admin code and
// vice-versa.
//
//   import { createApiClient, createHttp, authEndpoints } from '@shopwave/api-client';
//   const http = createHttp(createApiClient({ baseURL }));
//   const api = { auth: authEndpoints(http), ...appDomainEndpoints };

export {
  createApiClient,
  createHttp,
  getErrorMessage,
  type ApiClientOptions,
  type Http,
} from './client';

export { authEndpoints } from './endpoints/auth';
