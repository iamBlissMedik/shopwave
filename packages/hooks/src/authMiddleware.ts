import { NextResponse, type NextRequest } from 'next/server';

/**
 * Shared edge-middleware factory for cookie-presence auth gating, used by all
 * three apps so the redirect logic lives in ONE place.
 *
 * This module imports only `next/server` (no React / client code), so it is safe
 * to pull into the edge runtime. Import it via the `@shopwave/hooks/middleware`
 * subpath — NOT the package barrel — to keep the edge bundle tiny.
 *
 * Two gating models:
 *  - **Allowlist** (storefront): pass `protectedPaths` — only those prefixes
 *    need auth; everything else is public.
 *  - **Denylist** (dashboard): omit `protectedPaths` — everything needs auth
 *    except the `publicPaths` prefixes (e.g. `/login`).
 *
 * The cookie is only checked for *presence* (a fast first line of defense); the
 * API still verifies the JWT signature and role on every request.
 */
const COOKIE_NAME = 'token';

export interface AuthMiddlewareConfig {
  /** Allowlist model: only these path prefixes require auth. */
  protectedPaths?: string[];
  /** Path prefixes that are always public (e.g. `['/login']`). */
  publicPaths?: string[];
}

export function createAuthMiddleware({ protectedPaths, publicPaths = [] }: AuthMiddlewareConfig = {}) {
  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (publicPaths.some((p) => pathname.startsWith(p))) return NextResponse.next();

    // Allowlist: only `protectedPaths` need auth. Denylist (no list): everything.
    const requiresAuth = protectedPaths ? protectedPaths.some((p) => pathname.startsWith(p)) : true;
    if (!requiresAuth) return NextResponse.next();

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  };
}
