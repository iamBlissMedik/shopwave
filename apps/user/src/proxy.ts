import { createAuthProxy } from '@shopwave/hooks/proxy';

/**
 * Storefront gating: only order history requires an auth cookie. The catalogue
 * and the cart are public — guests get a server-side session cart that merges
 * into their account on login, and checkout itself asks them to log in. The
 * redirect logic is shared via the factory; the `matcher` stays here because
 * Next requires it to be a static export.
 */
export const proxy = createAuthProxy({ protectedPaths: ['/orders'] });

export const config = {
  matcher: ['/orders/:path*'],
};
