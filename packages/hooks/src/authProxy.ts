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
 */
const COOKIE_NAME = 'token';

export interface AuthProxyConfig {
  /** Allowlist model: only these path prefixes require auth. */
  protectedPaths?: string[];
  /** Path prefixes that are always public (e.g. `['/login']`). */
  publicPaths?: string[];
}

export function createAuthProxy({ protectedPaths, publicPaths = [] }: AuthProxyConfig = {}) {
  return function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    if (publicPaths.some((p) => pathname.startsWith(p))) return NextResponse.next();

    // Allowlist: only `protectedPaths` need auth. Denylist (no list): everything.
    const requiresAuth = protectedPaths ? protectedPaths.some((p) => pathname.startsWith(p)) : true;
    if (!requiresAuth) return NextResponse.next();

    if (!request.cookies.get(COOKIE_NAME)?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  };
}
