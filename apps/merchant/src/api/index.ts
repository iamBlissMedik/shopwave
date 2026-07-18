// The merchant dashboard's own API surface. Built on the shared transport
// (`http`) from @shopwave/hooks; the merchant endpoint definitions live here so
// only this app ships them.
import { http } from '@shopwave/hooks';
import { merchantEndpoints, type MerchantProductFilters, type ProductPayload } from './merchant';

export const api = { merchant: merchantEndpoints(http) };

export type { MerchantProductFilters, ProductPayload };
