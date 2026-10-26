import { createAuthProxy } from '@shopwave/hooks/proxy';

/**
 * Dashboard gating: everything except `/login` requires an auth cookie. The
 * dashboard layout then verifies the session and the ADMIN role on the server,
 * and the API enforces the role on every request (defense in depth).
 */
export const proxy = createAuthProxy({ publicPaths: ['/login'] });

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
