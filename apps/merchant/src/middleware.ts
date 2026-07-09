import { createAuthMiddleware } from '@shopwave/hooks/middleware';

/**
 * Merchant dashboard gating: everything except `/login` requires an auth cookie.
 * The API additionally enforces the MERCHANT role on every request, and
 * `RoleGuard` redirects non-merchants client-side (defense in depth).
 */
export const middleware = createAuthMiddleware({ publicPaths: ['/login'] });

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
