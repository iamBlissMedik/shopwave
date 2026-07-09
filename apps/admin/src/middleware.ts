import { createAuthMiddleware } from '@shopwave/hooks/middleware';

/**
 * Admin console gating: everything except `/login` requires an auth cookie. The
 * API additionally enforces the ADMIN role on every request, and `RoleGuard`
 * redirects non-admins client-side (defense in depth).
 */
export const middleware = createAuthMiddleware({ publicPaths: ['/login'] });

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
