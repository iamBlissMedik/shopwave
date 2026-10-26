import 'server-only';

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authEndpoints, createHttp, HttpError, type Http } from '@shopwave/api-client';
import type { Role, User } from '@shopwave/types';
import { PATHNAME_HEADER } from './authProxy';
import { clientIpFromForwardedFor, parseTrustedHops } from './forwardedFor';
import { makeQueryClient } from './queryClient';

/**
 * Server-only helpers for Server Components (import via `@shopwave/hooks/server`).
 *
 * SSR requests go to `API_URL` — the API's internal address — falling back to
 * the public `NEXT_PUBLIC_API_URL`. Calling it directly (not through the public
 * load balancer) keeps the Next server a single proxy hop in front of the API,
 * which trusts exactly one hop, so the address forwarded below is what its rate
 * limits key on.
 */
const baseURL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** Proxies in front of *this* Next server (load balancer, CDN…); see `.env.example`. */
const trustedProxyHops = parseTrustedHops(process.env.TRUSTED_PROXY_HOPS);

/**
 * An `Http` that calls the API as the current visitor: their cookies, and their
 * IP resolved from the trusted end of `X-Forwarded-For` — never the raw header,
 * whose left-hand entries the client controls. The API sees a single entry.
 */
export async function getServerHttp(): Promise<Http> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const clientIp = clientIpFromForwardedFor(headerStore.get('x-forwarded-for'), trustedProxyHops);
  return createHttp({
    baseURL,
    headers: {
      cookie: cookieStore.toString(),
      ...(clientIp ? { 'x-forwarded-for': clientIp } : {}),
    },
  });
}

/**
 * Binds an app's endpoint factory to the per-request server transport, so each
 * app's `api/server.ts` is one line: `export const getServerApi = createServerApi(createApi)`.
 *
 * Pass `role` for a dashboard: every call then waits for `requireServerUser(role)`
 * first. Next renders a page in parallel with its layout, so without this a page's
 * prefetch would call the API with a dead session before the layout's guard
 * redirected. The session check is cached per request, so it costs one `/auth/me`.
 */
export function createServerApi<T>(
  createApi: (http: Http) => T,
  { role }: { role?: Role } = {},
): () => Promise<T> {
  return async () => {
    if (role) await requireServerUser(role);
    return createApi(await getServerHttp());
  };
}

/**
 * What the API said about the visitor's session. `unavailable` means it couldn't
 * say (network error, 5xx): that is *not* the same as signed out, and must never
 * be cached or acted on as if it were.
 */
export type ServerSession =
  | { status: 'signed-in'; user: User }
  | { status: 'signed-out' }
  | { status: 'unavailable' };

/**
 * The visitor's session, cached per request so the root layout and a page guard
 * share one `/auth/me` call. Never throws for API problems, so public pages
 * still render while the API is down.
 */
export const getServerSession = cache(async (): Promise<ServerSession> => {
  // Outside the `try`: reading cookies is how Next detects a dynamic route, and
  // its internal signal must propagate rather than be mistaken for an API error.
  const http = await getServerHttp();
  try {
    const { user } = await authEndpoints(http).me();
    return { status: 'signed-in', user };
  } catch (error) {
    // 401 = no / expired session, 404 = the account was deleted: both mean "signed out".
    if (error instanceof HttpError && (error.status === 401 || error.status === 404)) {
      return { status: 'signed-out' };
    }
    console.error('getServerSession: could not load the session', error);
    return { status: 'unavailable' };
  }
});

/** Thrown by `getServerUser` when the API can't confirm the session either way. */
export class SessionUnavailableError extends Error {
  constructor() {
    super('The session could not be verified because the API is unavailable.');
    this.name = 'SessionUnavailableError';
  }
}

/**
 * For page guards: the signed-in user, or `null` when definitely signed out.
 * Throws `SessionUnavailableError` when the API can't say, so the route's error
 * boundary offers a retry instead of sending a signed-in user to `/login`.
 */
export async function getServerUser(): Promise<User | null> {
  const session = await getServerSession();
  if (session.status === 'unavailable') throw new SessionUnavailableError();
  return session.status === 'signed-in' ? session.user : null;
}

/**
 * Guard for a role-restricted area: the signed-in user if they have `role`,
 * otherwise a redirect to `/login` (back to this page afterwards). Throws
 * `SessionUnavailableError` when the API is down, like `getServerUser`.
 */
export async function requireServerUser(role: Role): Promise<User> {
  const user = await getServerUser();
  if (user?.role !== role) return redirectToLogin();
  return user;
}

/**
 * Sends the visitor to `/login`, returning to the current page afterwards. The
 * path comes from the app's `proxy` (`PATHNAME_HEADER`); without it, plain `/login`.
 * The login page sanitizes the value with `safeRedirect`.
 */
export async function redirectToLogin(): Promise<never> {
  const path = (await headers()).get(PATHNAME_HEADER);
  redirect(path ? `/login?redirect=${encodeURIComponent(path)}` : '/login');
}

/** A per-request QueryClient for prefetching; failures fall back to client fetching. */
export function makeServerQueryClient() {
  return makeQueryClient({ defaultOptions: { queries: { retry: false } } });
}
