// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Stand-ins for the Next request scope that Server Components run in.
const requestHeaders = new Headers();
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({ toString: () => 'token=abc' }),
  headers: async () => requestHeaders,
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));

const fetchMock = vi.fn<typeof fetch>();
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const user = { id: 'u1', email: 'ada@example.com', name: 'Ada', role: 'MERCHANT' };

// Fresh module per test: `getServerSession` is wrapped in React's per-request `cache`.
// Mocks build a new Response per call, since a body can only be read once.
const load = () => import('../server');

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  for (const key of [...requestHeaders.keys()]) requestHeaders.delete(key);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  fetchMock.mockReset();
  delete process.env.TRUSTED_PROXY_HOPS;
});

describe('getServerHttp', () => {
  it("forwards the visitor's cookie and only the trusted client IP", async () => {
    requestHeaders.set('x-forwarded-for', '1.2.3.4, 203.0.113.7'); // forged entry, then the LB's
    fetchMock.mockImplementation(async () => json(200, { user }));
    const { getServerHttp } = await load();

    await (await getServerHttp()).get('/auth/me');

    const sent = new Headers(fetchMock.mock.calls[0]![1]!.headers);
    expect(sent.get('cookie')).toBe('token=abc');
    expect(sent.get('x-forwarded-for')).toBe('203.0.113.7');
  });

  it('honours TRUSTED_PROXY_HOPS', async () => {
    process.env.TRUSTED_PROXY_HOPS = '2';
    requestHeaders.set('x-forwarded-for', '1.2.3.4, 203.0.113.7, 10.0.0.5');
    fetchMock.mockImplementation(async () => json(200, { user }));
    const { getServerHttp } = await load();

    await (await getServerHttp()).get('/auth/me');

    expect(new Headers(fetchMock.mock.calls[0]![1]!.headers).get('x-forwarded-for')).toBe('203.0.113.7');
  });
});

describe('getServerSession / getServerUser', () => {
  it('reports a signed-in user', async () => {
    fetchMock.mockImplementation(async () => json(200, { user }));
    const { getServerSession, getServerUser } = await load();
    expect(await getServerSession()).toEqual({ status: 'signed-in', user });
    expect(await getServerUser()).toEqual(user);
  });

  it.each([401, 404])('treats %i as signed out', async (status) => {
    fetchMock.mockImplementation(async () => json(status, { error: { message: 'nope' } }));
    const { getServerSession, getServerUser } = await load();
    expect(await getServerSession()).toEqual({ status: 'signed-out' });
    expect(await getServerUser()).toBeNull();
  });

  it.each([
    ['a 5xx', () => Promise.resolve(json(503, { error: { message: 'down' } }))],
    ['a network failure', () => Promise.reject(new TypeError('fetch failed'))],
  ])('reports %s as unavailable, never as signed out', async (_label, respond) => {
    fetchMock.mockImplementation(respond);
    const { getServerSession, getServerUser, SessionUnavailableError } = await load();
    expect(await getServerSession()).toEqual({ status: 'unavailable' });
    await expect(getServerUser()).rejects.toBeInstanceOf(SessionUnavailableError);
  });
});

describe('redirectToLogin', () => {
  it('returns the visitor to the page the proxy recorded', async () => {
    requestHeaders.set('x-shopwave-pathname', '/products/abc/edit?tab=price');
    const { redirectToLogin } = await load();
    await expect(redirectToLogin()).rejects.toThrow(
      `NEXT_REDIRECT /login?redirect=${encodeURIComponent('/products/abc/edit?tab=price')}`,
    );
  });

  it('falls back to plain /login without the header', async () => {
    const { redirectToLogin } = await load();
    await expect(redirectToLogin()).rejects.toThrow(/^NEXT_REDIRECT \/login$/);
  });
});

describe('createServerApi with a role (dashboard data fetches)', () => {
  // The endpoint factory records every data call it makes.
  const dataCalls: string[] = [];
  const createApi = (http: { get: <T>(url: string) => Promise<T> }) => ({
    stats: () => (dataCalls.push('/admin/stats'), http.get('/admin/stats')),
  });
  beforeEach(() => {
    dataCalls.length = 0;
    requestHeaders.set('x-shopwave-pathname', '/products?page=2');
  });

  it('calls the API once the session has the right role', async () => {
    fetchMock.mockImplementation(async (url) =>
      String(url).endsWith('/auth/me') ? json(200, { user: { ...user, role: 'ADMIN' } }) : json(200, { ok: true }),
    );
    const { createServerApi } = await load();
    const api = await createServerApi(createApi, { role: 'ADMIN' })();
    await expect(api.stats()).resolves.toEqual({ ok: true });
  });

  it.each([
    ['an expired session', () => json(401, { error: { message: 'Unauthorized' } })],
    ['the wrong role', () => json(200, { user })], // a MERCHANT on the admin app
  ])('redirects to login without building the API for %s', async (_label, me) => {
    fetchMock.mockImplementation(async () => me());
    const { createServerApi } = await load();
    await expect(createServerApi(createApi, { role: 'ADMIN' })()).rejects.toThrow(
      `NEXT_REDIRECT /login?redirect=${encodeURIComponent('/products?page=2')}`,
    );
    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).pathname)).toEqual(['/api/auth/me']);
  });

  it('throws SessionUnavailableError (no data calls) when the API is down', async () => {
    fetchMock.mockImplementation(async () => json(503, { error: { message: 'down' } }));
    const { createServerApi, SessionUnavailableError } = await load();
    await expect(createServerApi(createApi, { role: 'ADMIN' })()).rejects.toBeInstanceOf(
      SessionUnavailableError,
    );
    expect(dataCalls).toEqual([]);
  });

  it('skips the check without a role (public storefront pages)', async () => {
    fetchMock.mockImplementation(async () => json(200, { ok: true }));
    const { createServerApi } = await load();
    await (await createServerApi(createApi)()).stats();
    expect(fetchMock.mock.calls.map(([url]) => new URL(String(url)).pathname)).toEqual(['/api/admin/stats']);
  });
});
