// The admin console's own API surface. Built on the shared transport (`http`)
// from @shopwave/hooks; the admin endpoint definitions live here so only this
// app ships them.
import { http } from '@shopwave/hooks';
import { adminEndpoints, type AdminUserFilters, type AdminProductFilters } from './admin';

export const api = { admin: adminEndpoints(http) };

export type { AdminUserFilters, AdminProductFilters };
