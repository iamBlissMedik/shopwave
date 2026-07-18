import { createApiClient, createHttp, getErrorMessage, authEndpoints } from '@shopwave/api-client';

/**
 * The configured transport every app shares.
 *
 * `NEXT_PUBLIC_API_URL` is inlined per app at build time, so each of the user /
 * merchant / admin apps points at the same API with its own env value. There is
 * exactly one client instance per app runtime.
 *
 * Only `auth` is bound here, because logging in is common to all three apps.
 * Each app builds its own domain endpoints (products, merchant, admin, …) on
 * top of this same `http` — see each app's `src/api`.
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const http = createHttp(createApiClient({ baseURL }));
export const api = { auth: authEndpoints(http) };

export { getErrorMessage };
