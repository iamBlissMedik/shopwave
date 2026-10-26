import { NextResponse, type NextRequest } from 'next/server';

/**
 * Shared `proxy` (formerly "middleware") factory for cookie-presence gating,
 * used by all three apps so the redirect logic lives in ONE place.
 *
 * This module imports only `next/server` (no React / client code). Import it via
 * the `@shopwave/hooks/proxy` subpath — NOT the package barrel.
 *
 * Two gating models:
 *  - **Allowlist** (storefront): pass `protectedPaths` — only those prefixes
 *    need auth; everything else is public.
 *  - **Denylist** (dashboard): omit `protectedPaths` — everything needs auth
 *    except the `publicPaths` prefixes (e.g. `/login`).
 *
 * The cookie is only checked for *presence*: a cheap first redirect that keeps
 * the deep link in `?redirect=`. It is not the security boundary — the server
 * components verify the session with the API (`getServerUser`), and the API
 * authorizes every request by role.
 *
 * Requests it lets through carry the visited path in `PATHNAME_HEADER`, so a
 * server-side guard that finds an expired session can still send the visitor
 * back here after login (`redirectToLogin` in `@shopwave/hooks/server`).
 */
const COOKIE_NAME = 'token';

/** Request header carrying `pathname + search` to Server Components (which can't read the URL). */
export const PATHNAME_HEADER = 'x-shopwave-pathname';

export interface AuthProxyConfig {
  /** Allowlist model: only these path prefixes require auth. */
  protectedPaths?: string[];
  /** Path prefixes that are always public (e.g. `['/login']`). */
  publicPaths?: string[];
}

export function createAuthProxy({ protectedPaths, publicPaths = [] }: AuthProxyConfig = {}) {
  return function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // Overwrite (never trust) any incoming value, then continue with it attached.
    const next = () => {
      const headers = new Headers(request.headers);
      headers.set(PATHNAME_HEADER, pathname + search);
      return NextResponse.next({ request: { headers } });
    };

    if (publicPaths.some((p) => pathname.startsWith(p))) return next();

    // Allowlist: only `protectedPaths` need auth. Denylist (no list): everything.
    const requiresAuth = protectedPaths ? protectedPaths.some((p) => pathname.startsWith(p)) : true;
    if (!requiresAuth) return next();

    if (!request.cookies.get(COOKIE_NAME)?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    return next();
  };
}
