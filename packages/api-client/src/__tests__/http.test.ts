import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, createHttp, getErrorMessage } from '../http';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const respond = (status: number, body: unknown) =>
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));

afterEach(() => fetchMock.mockReset());

describe('createHttp', () => {
  const http = createHttp({
    baseURL: 'http://api.test/api',
    headers: { cookie: 'token=abc' },
    credentials: 'include',
  });

  it('serializes params (dropping nullish ones) and sends the configured options', async () => {
    respond(200, { data: [] });
    await http.get('/products', { page: 2, search: undefined, category: null, sort: 'newest' });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('http://api.test/api/products?page=2&sort=newest');
    expect(init).toMatchObject({ method: 'GET', cache: 'no-store', credentials: 'include' });
    expect(init.headers.cookie).toBe('token=abc');
  });

  it('returns the parsed JSON body', async () => {
    respond(200, { user: { id: 'u1' } });
    await expect(http.get('/auth/me')).resolves.toEqual({ user: { id: 'u1' } });
  });

  it('sends JSON bodies on writes', async () => {
    respond(200, { ok: true });
    await http.post('/cart/items', { productId: 'p1' });
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"productId":"p1"}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('throws an HttpError carrying the status and the API envelope message', async () => {
    respond(409, { error: { message: 'An account with this email already exists' } });
    const error = await http.post('/auth/register', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({
      status: 409,
      message: 'An account with this email already exists',
    });
  });

  it('falls back to a status message when the error has no envelope', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad gateway', { status: 502 }));
    await expect(http.get('/x')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    });
  });

  it('turns a network failure into a readable HttpError with status 0', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(http.get('/x')).rejects.toMatchObject({
      status: 0,
      message: 'Could not reach the server — check your connection',
    });
  });
});

describe('getErrorMessage', () => {
  it('returns the message of any Error (including HttpError)', () => {
    expect(getErrorMessage(new HttpError(404, 'Product not found'))).toBe('Product not found');
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a generic fallback for non-error values', () => {
    expect(getErrorMessage('just a string')).toBe('Something went wrong');
    expect(getErrorMessage(undefined)).toBe('Something went wrong');
    expect(getErrorMessage({ weird: true })).toBe('Something went wrong');
  });
});
