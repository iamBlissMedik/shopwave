/**
 * Sanitize a post-login `?redirect=` target. Only same-app relative paths are
 * allowed — anything else (absolute URLs, protocol-relative `//evil.com`,
 * backslash tricks) falls back to `/`, so the login page can't be abused as an
 * open redirect. `/login` itself is rejected to avoid a redirect loop.
 */
export function safeRedirect(target: string | null | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) {
    return fallback;
  }
  if (target === '/login' || target.startsWith('/login?')) return fallback;
  return target;
}
