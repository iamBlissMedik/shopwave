import axios, { AxiosError, type AxiosInstance } from 'axios';

/**
 * Centralized API client — the single gateway between any frontend app and the
 * Express API. The user, merchant and admin apps all build their client from
 * this factory, so cross-cutting behaviour (auth cookie, error shape, timeouts,
 * future token refresh) lives in exactly one place.
 *
 * `withCredentials: true` is the key line: it tells the browser to send and
 * store the httpOnly auth cookie on cross-origin requests to the API. Combined
 * with the API's CORS `credentials: true`, this is how authentication "just
 * works" without us ever touching the JWT in JavaScript.
 */
export interface ApiClientOptions {
  /** API base URL, e.g. `https://api.app.com/api`. */
  baseURL: string;
}

export function createApiClient({ baseURL }: ApiClientOptions): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
  });
}

/** Normalize the API's `{ error: { message } }` envelope into a plain string. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message ?? error.message ?? 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

/**
 * Thin typed helpers bound to a client instance, so endpoint modules read
 * cleanly: `http.get<Cart>('/cart')` instead of unwrapping `response.data`.
 */
export type Http = {
  get: <T>(url: string, params?: unknown) => Promise<T>;
  post: <T>(url: string, body?: unknown) => Promise<T>;
  patch: <T>(url: string, body?: unknown) => Promise<T>;
  delete: <T>(url: string) => Promise<T>;
};

export function createHttp(instance: AxiosInstance): Http {
  return {
    get: (url, params) => instance.get(url, { params }).then((r) => r.data),
    post: (url, body) => instance.post(url, body).then((r) => r.data),
    patch: (url, body) => instance.patch(url, body).then((r) => r.data),
    delete: (url) => instance.delete(url).then((r) => r.data),
  };
}
