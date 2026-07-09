// Public surface of @shopwave/api-client.
//
//   import { createApiClient, createHttp, createEndpoints } from '@shopwave/api-client';
//   const http = createHttp(createApiClient({ baseURL }));
//   const api = createEndpoints(http);
//   await api.products.list({ page: 1 });

export {
  createApiClient,
  createHttp,
  getErrorMessage,
  type ApiClientOptions,
  type Http,
} from './client';

export { createEndpoints, type Endpoints } from './endpoints';
export type { ProductFilters } from './endpoints/products';
export type { MerchantProductFilters, ProductPayload } from './endpoints/merchant';
export type { AdminUserFilters, AdminProductFilters } from './endpoints/admin';
