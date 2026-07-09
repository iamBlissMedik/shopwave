import { describe, it, expect } from 'vitest';
import type { Express } from 'express';
import { createApp } from '../../app';
import { ROUTES } from '../openapi';

/**
 * Enforcement: every mounted `/api/*` route MUST be documented in the OpenAPI
 * ROUTES table, and vice-versa. Add a route without documenting it and this
 * test fails — that's how "any new service must be documented" is guaranteed.
 */

const extractSegment = (re: RegExp): string => {
  const m = /^\^\\\/([\w-]+)\\\/\?/.exec(re.source);
  return m ? `/${m[1]}` : '';
};

const tidy = (p: string) => p.replace(/\/+/g, '/').replace(/(.)\/$/, '$1');

/** Convert OpenAPI `{param}` → Express `:param` for comparison. */
const canonical = (p: string) => p.replace(/\{(\w+)\}/g, ':$1');

function listExpressRoutes(app: Express): string[] {
  const out: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (stack: any[], prefix: string) => {
    for (const layer of stack) {
      if (layer.route) {
        const path = tidy(prefix + layer.route.path);
        for (const m of Object.keys(layer.route.methods)) {
          if (layer.route.methods[m]) out.push(`${m.toLowerCase()} ${path}`);
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        walk(layer.handle.stack, prefix + extractSegment(layer.regexp));
      }
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walk((app as any)._router.stack, '');
  return out.filter((r) => r.includes(' /api/'));
}

describe('OpenAPI route coverage', () => {
  const app = createApp();
  const actual = listExpressRoutes(app);
  const documented = ROUTES.map((r) => `${r.method} ${canonical(r.path)}`);

  it('discovers the real API routes', () => {
    expect(actual.length).toBeGreaterThan(20);
  });

  it('documents every mounted /api route (no undocumented services)', () => {
    const set = new Set(documented);
    const undocumented = actual.filter((r) => !set.has(r));
    expect(undocumented).toEqual([]);
  });

  it('every documented route actually exists', () => {
    const set = new Set(actual);
    const missing = documented.filter((r) => !set.has(r));
    expect(missing).toEqual([]);
  });
});
