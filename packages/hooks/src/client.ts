import { createApiClient, createHttp, createEndpoints, getErrorMessage } from '@shopwave/api-client';

/**
 * The configured API surface every hook talks to.
 *
 * `NEXT_PUBLIC_API_URL` is inlined per app at build time, so each of the user /
 * merchant / admin apps points at the same API with its own env value. There is
 * exactly one client instance per app runtime.
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const http = createHttp(createApiClient({ baseURL }));
export const api = createEndpoints(http);

export { getErrorMessage };
