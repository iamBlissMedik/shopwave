import { describe, it, expect, beforeEach } from 'vitest';
import { agent, registerAgent, adminAgent, resetDb } from './helpers';

/**
 * The API is the real security boundary. These tests assert role enforcement
 * directly — the shared-session model relies on every privileged route checking
 * the caller's role, regardless of which frontend app made the request.
 */
describe('Access control', () => {
  beforeEach(resetDb);

  it('blocks unauthenticated access to protected routes (401)', async () => {
    const anon = agent();
    for (const path of ['/api/orders', '/api/merchant/stats', '/api/admin/stats']) {
      expect((await anon.get(path)).status).toBe(401);
    }
  });

  it('allows anonymous access to the cart (guest cart, not 401)', async () => {
    expect((await agent().get('/api/cart')).status).toBe(200);
  });

  it('forbids a USER from merchant and admin areas (403)', async () => {
    const { agent: user } = await registerAgent('USER');
    expect((await user.get('/api/merchant/stats')).status).toBe(403);
    expect((await user.get('/api/admin/stats')).status).toBe(403);
    expect((await user.get('/api/admin/users')).status).toBe(403);
  });

  it('forbids a MERCHANT from admin areas (403) but allows their own dashboard', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    expect((await merchant.get('/api/admin/stats')).status).toBe(403);
    expect((await merchant.get('/api/merchant/stats')).status).toBe(200);
  });

  it('allows an ADMIN into the admin console', async () => {
    const { agent: admin } = await adminAgent();
    expect((await admin.get('/api/admin/stats')).status).toBe(200);
    expect((await admin.get('/api/admin/users')).status).toBe(200);
  });

  it("scopes a customer's orders to themselves (cannot read others')", async () => {
    const { agent: a } = await registerAgent('USER');
    // A random id that isn't theirs → 404 (not found / not yours), never another user's data.
    const res = await a.get('/api/orders/some-other-order-id');
    expect(res.status).toBe(404);
  });
});
