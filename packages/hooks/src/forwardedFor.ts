/**
 * The visitor's IP from an `X-Forwarded-For` chain, given how many trusted
 * proxies sit in front of the Next server (load balancer, CDN, Vercel's edge…).
 *
 * Every proxy appends the address it received the request from, so with N
 * trusted hops the visitor is the Nth entry from the end. Anything further left
 * was sent by the client and can be forged, so it is never used.
 *
 * Next fills the header with the socket address when it's missing, so in local
 * development (no proxy) the chain is just the visitor and the first entry wins.
 */
export function clientIpFromForwardedFor(
  header: string | null | undefined,
  trustedHops: number,
): string | undefined {
  const chain = (header ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (chain.length === 0) return undefined;

  const hops = Number.isInteger(trustedHops) && trustedHops >= 1 ? trustedHops : 1;
  return chain[Math.max(0, chain.length - hops)];
}

/** `TRUSTED_PROXY_HOPS` as a positive integer; anything else falls back to 1. */
export function parseTrustedHops(value: string | undefined): number {
  const hops = Number(value);
  return Number.isInteger(hops) && hops >= 1 ? hops : 1;
}
