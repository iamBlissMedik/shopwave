// The merchant dashboard's browser API client: this app's own endpoints on the
// shared transport (`http`) from @shopwave/hooks.
import { http } from '@shopwave/hooks';
import { createApi } from './create';

export const api = createApi(http);

export type { Api } from './create';
export type { MerchantProductFilters, ProductPayload } from './merchant';
