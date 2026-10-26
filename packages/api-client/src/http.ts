/**
 * The single transport between every app and the Express API, built on the
 * platform `fetch`, so the exact same code runs in the browser and in Server
 * Components (no HTTP library shipped to the client).
 *
 *  - Browser: `credentials: 'include'` sends and stores the httpOnly auth cookie
 *    on cross-origin requests to the API (with the API's CORS `credentials:
 *    true`) — authentication "just works" without JS ever touching the JWT.
 *  - Server: pass the visitor's `cookie` header instead.
 *
 * Responses are never HTTP-cached (`no-store`): pages show live stock and prices.
 */

/** A failed request: the API's own error message, plus the HTTP status (0 = no response). */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Typed helpers each endpoint factory receives: `http.get<Cart>('/cart')`. */
export type Http = {
  get: <T>(url: string, params?: unknown) => Promise<T>;
  post: <T>(url: string, body?: unknown) => Promise<T>;
  patch: <T>(url: string, body?: unknown) => Promise<T>;
  delete: <T>(url: string) => Promise<T>;
};

export interface HttpOptions {
  /** API base URL, e.g. `https://api.app.com/api`. */
  baseURL: string;
  /** Headers sent with every request (e.g. the visitor's `cookie` on the server). */
  headers?: Record<string, string>;
  /** `'include'` in the browser so the auth cookie travels cross-origin. */
  credentials?: RequestCredentials;
  /** Abort requests that take longer than this. */
  timeoutMs?: number;
}

/** `{ a: 1, b: undefined }` → `?a=1` (nullish params are dropped). */
function toQueryString(params: unknown): string {
  if (!params || typeof params !== 'object') return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function createHttp({
  baseURL,
  headers = {},
  credentials,
  timeoutMs = 15_000,
}: HttpOptions): Http {
  const request = async <T>(method: string, url: string, body?: unknown): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(`${baseURL}${url}`, {
        method,
        credentials,
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
      throw new HttpError(
        0,
        timedOut ? 'The request timed out' : 'Could not reach the server — check your connection',
      );
    }

    const data = (await res.json().catch(() => undefined)) as
      | { error?: { message?: string } }
      | undefined;
    if (!res.ok) {
      throw new HttpError(
        res.status,
        data?.error?.message ?? `Request failed with status ${res.status}`,
      );
    }
    return data as T;
  };

  return {
    get: (url, params) => request('GET', `${url}${toQueryString(params)}`),
    post: (url, body) => request('POST', url, body),
    patch: (url, body) => request('PATCH', url, body),
    delete: (url) => request('DELETE', url),
  };
}

/** Any thrown value → a display string (the API's message when there is one). */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong';
}
