// Public surface of @shopwave/api-client.
//
// This package is deliberately thin: it owns the *transport* (a fetch-based
// `Http` that runs in the browser and in Server Components, plus error
// normalization) and the one endpoint group shared by every app — `auth`. Each
// app builds and owns its own domain endpoints (products, cart, orders,
// merchant, admin) on top of this transport, so the storefront never ships
// merchant/admin code and vice-versa.
//
//   import { createHttp, authEndpoints } from '@shopwave/api-client';
//   const http = createHttp({ baseURL, credentials: 'include' });
//   const api = { auth: authEndpoints(http), ...appDomainEndpoints };

export { createHttp, getErrorMessage, HttpError, type Http, type HttpOptions } from './http';
export { authEndpoints } from './endpoints/auth';
