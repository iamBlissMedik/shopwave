/**
 * Sanitize a post-login `?redirect=` target. Only same-app relative paths are
 * allowed — anything else (absolute URLs, protocol-relative `//evil.com`,
 * backslash tricks, or control characters the URL parser silently strips, as
 * in `/\t/evil.com` → `//evil.com`) falls back to `/`, so the login page can't
 * be abused as an open redirect. `/login` itself is rejected to avoid a
 * redirect loop.
 */
export function safeRedirect(target: string | null | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/')) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(target)) return fallback;

  // Resolve against a throwaway origin: if it lands anywhere else, it's not a path.
  const base = 'http://safe-redirect.invalid';
  let url: URL;
  try {
    url = new URL(target, base);
  } catch {
    return fallback;
  }
  if (url.origin !== base) return fallback;
  if (url.pathname === '/login') return fallback;
  return target;
}
