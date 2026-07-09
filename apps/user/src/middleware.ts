import { createAuthMiddleware } from '@shopwave/hooks/middleware';

/**
 * Storefront gating: only the cart/orders flows require an auth cookie; the rest
 * of the catalogue is public. Redirect logic is shared via the factory; the
 * `matcher` stays here because Next requires it to be a static export.
 */
export const middleware = createAuthMiddleware({ protectedPaths: ['/cart', '/orders'] });

export const config = {
  matcher: ['/cart/:path*', '/orders/:path*'],
};
