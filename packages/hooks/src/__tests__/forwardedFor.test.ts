import { describe, it, expect } from 'vitest';
import { clientIpFromForwardedFor, parseTrustedHops } from '../forwardedFor';

describe('clientIpFromForwardedFor', () => {
  it('takes the address appended by the single trusted proxy', () => {
    expect(clientIpFromForwardedFor('203.0.113.7', 1)).toBe('203.0.113.7');
    expect(clientIpFromForwardedFor('10.0.0.1, 203.0.113.7', 1)).toBe('203.0.113.7');
  });

  it('ignores entries a client forged to the left of the trusted ones', () => {
    // The client sent "1.2.3.4"; the load balancer appended the real address.
    expect(clientIpFromForwardedFor('1.2.3.4, 203.0.113.7', 1)).toBe('203.0.113.7');
    // Two trusted hops (CDN -> load balancer): the CDN's entry is the visitor.
    expect(clientIpFromForwardedFor('1.2.3.4, 203.0.113.7, 10.0.0.5', 2)).toBe('203.0.113.7');
  });

  it('uses the first entry when the chain is shorter than the hop count (no proxy, e.g. local dev)', () => {
    expect(clientIpFromForwardedFor('::1', 2)).toBe('::1');
  });

  it('tolerates whitespace and empty entries', () => {
    expect(clientIpFromForwardedFor(' 1.2.3.4 ,, 203.0.113.7 ', 1)).toBe('203.0.113.7');
  });

  it('returns undefined when there is no usable address', () => {
    expect(clientIpFromForwardedFor(null, 1)).toBeUndefined();
    expect(clientIpFromForwardedFor('', 1)).toBeUndefined();
    expect(clientIpFromForwardedFor(' , ', 1)).toBeUndefined();
  });

  it('treats an invalid hop count as 1', () => {
    expect(clientIpFromForwardedFor('1.2.3.4, 203.0.113.7', 0)).toBe('203.0.113.7');
    expect(clientIpFromForwardedFor('1.2.3.4, 203.0.113.7', Number.NaN)).toBe('203.0.113.7');
  });
});

describe('parseTrustedHops', () => {
  it('accepts positive integers and falls back to 1 otherwise', () => {
    expect(parseTrustedHops('2')).toBe(2);
    expect(parseTrustedHops(undefined)).toBe(1);
    expect(parseTrustedHops('0')).toBe(1);
    expect(parseTrustedHops('-1')).toBe(1);
    expect(parseTrustedHops('1.5')).toBe(1);
    expect(parseTrustedHops('abc')).toBe(1);
  });
});
