/**
 * Helpers for URL-driven page state (filters, pagination). Pure functions with
 * no React, so the same parser runs in a Server Component (to prefetch) and in
 * the browser (to read the live URL) — producing identical query keys, which is
 * what lets server-prefetched data hydrate straight into the client cache.
 */

/** A page's `searchParams` prop (`Record<string, string | string[]>`) → URLSearchParams. */
export function toURLSearchParams(
  record: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return params;
}

/** A non-empty trimmed string, or `undefined`. */
export function readString(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

/** A non-negative integer, or `fallback` when missing / malformed. */
export function readInt(
  params: URLSearchParams,
  key: string,
  fallback?: number,
): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw === '') return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

/** A 1-based page number (defaults to 1). */
export function readPage(params: URLSearchParams): number {
  const page = readInt(params, 'page', 1)!;
  return page >= 1 ? page : 1;
}

/** One of an allowed set of values, or `fallback`. */
export function readEnum<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback?: T,
): T | undefined {
  const value = params.get(key);
  return allowed.includes(value as T) ? (value as T) : fallback;
}
