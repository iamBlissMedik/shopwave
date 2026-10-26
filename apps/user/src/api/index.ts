// The storefront's browser API client: this app's own endpoints (catalogue,
// cart, orders) on the shared transport (`http`) from @shopwave/hooks.
import { http } from '@shopwave/hooks';
import { createApi } from './create';

export const api = createApi(http);

export type { Api } from './create';
export type { ProductFilters } from './products';
