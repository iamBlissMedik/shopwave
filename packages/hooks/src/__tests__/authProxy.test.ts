// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { createAuthProxy, PATHNAME_HEADER } from '../authProxy';

// NextResponse.next({ request: { headers } }) hands rewritten request headers to
// the route through these response headers (Next's middleware protocol).
const forwarded = (res: Response, name: string) => res.headers.get(`x-middleware-request-${name}`);

const request = (path: string, init: { cookie?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(`https://admin.example.com${path}`, {
    headers: { ...(init.cookie ? { cookie: init.cookie } : {}), ...init.headers },
  });

describe('createAuthProxy', () => {
  const dashboard = createAuthProxy({ publicPaths: ['/login'] });

  it('redirects a visitor without a cookie to /login, keeping the deep link', () => {
    const res = dashboard(request('/products/abc/edit?tab=price'));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('redirect')).toBe('/products/abc/edit?tab=price');
  });

  it('passes the visited path to Server Components when it lets a request through', () => {
    const res = dashboard(request('/products/abc/edit?tab=price', { cookie: 'token=t' }));
    expect(res.status).toBe(200);
    expect(forwarded(res, PATHNAME_HEADER)).toBe('/products/abc/edit?tab=price');
  });

  it('overwrites a path header sent by the client', () => {
    const res = dashboard(
      request('/sales', { cookie: 'token=t', headers: { [PATHNAME_HEADER]: '//evil.example' } }),
    );
    expect(forwarded(res, PATHNAME_HEADER)).toBe('/sales');
  });

  it('lets public paths through without a cookie', () => {
    const res = dashboard(request('/login?redirect=/sales'));
    expect(res.status).toBe(200);
    expect(forwarded(res, PATHNAME_HEADER)).toBe('/login?redirect=/sales');
  });

  it('only gates protectedPaths in the allowlist model', () => {
    const storefront = createAuthProxy({ protectedPaths: ['/orders'] });
    expect(storefront(request('/products')).status).toBe(200);
    expect(storefront(request('/orders?page=3')).status).toBe(307);
  });
});
