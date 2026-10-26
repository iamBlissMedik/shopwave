import 'server-only';

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { authEndpoints, createHttp, HttpError, type Http } from '@shopwave/api-client';
import type { User } from '@shopwave/types';
import { makeQueryClient } from './queryClient';

/**
 * Server-only helpers for Server Components (import via `@shopwave/hooks/server`).
 *
 * SSR requests go to `API_URL` — the API's internal address — falling back to
 * the public `NEXT_PUBLIC_API_URL`. Calling it directly (not through the public
 * load balancer) keeps the Next server a single proxy hop, so the forwarded
 * `X-Forwarded-For` below is what the API's `trust proxy` reads as the client IP
 * and its rate limits stay per-visitor rather than per-Next-server.
 */
const baseURL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** An `Http` that calls the API as the current visitor (their cookies, their IP). */
export async function getServerHttp(): Promise<Http> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const forwardedFor = headerStore.get('x-forwarded-for');
  return createHttp({
    baseURL,
    headers: {
      cookie: cookieStore.toString(),
      ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
    },
  });
}

/**
 * The signed-in user, or `null` for guests / expired sessions. Cached per
 * request, so the root layout and a dashboard guard share one `/auth/me` call.
 * An unreachable API is logged and treated as "signed out" so public pages
 * still render instead of failing the whole document.
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  // Outside the `try`: reading cookies is how Next detects a dynamic route, and
  // its internal signal must propagate rather than be mistaken for an API error.
  const http = await getServerHttp();
  try {
    const { user } = await authEndpoints(http).me();
    return user;
  } catch (error) {
    // 401 = no / expired session, 404 = the account was deleted: both just mean "signed out".
    if (!(error instanceof HttpError && (error.status === 401 || error.status === 404))) {
      console.error('getServerUser: could not load the session', error);
    }
    return null;
  }
});

/** A per-request QueryClient for prefetching; failures fall back to client fetching. */
export function makeServerQueryClient() {
  return makeQueryClient({ defaultOptions: { queries: { retry: false } } });
}
