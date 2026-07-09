import { describe, it, expect, beforeEach } from 'vitest';
import { app, agent, registerAgent, resetDb } from './helpers';

describe('Auth', () => {
  beforeEach(resetDb);

  it('registers a customer, sets a cookie, and exposes them via /me', async () => {
    const { agent: a, res } = await registerAgent('USER');
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'USER', email: expect.any(String) });
    expect(res.headers['set-cookie']?.[0]).toMatch(/token=/);
    // The httpOnly cookie must never expose the password hash.
    expect(res.body.user.password).toBeUndefined();

    const me = await a.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(res.body.user.email);
  });

  it('registers a merchant with a store name', async () => {
    const { res } = await registerAgent('MERCHANT', { storeName: 'SoundLab' });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'MERCHANT', storeName: 'SoundLab' });
  });

  it('rejects a merchant without a store name', async () => {
    const res = await agent()
      .post('/api/auth/register')
      .send({ name: 'No Store', email: 'nostore@example.com', password: 'Password1!', role: 'MERCHANT' });
    expect(res.status).toBe(400);
  });

  it('uses an identical error for unknown email and wrong password (no enumeration)', async () => {
    await registerAgent('USER', { email: 'known@example.com' });

    const wrongPass = await agent().post('/api/auth/login').send({ email: 'known@example.com', password: 'nope' });
    const unknown = await agent().post('/api/auth/login').send({ email: 'ghost@example.com', password: 'nope' });

    expect(wrongPass.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPass.body.error.message).toBe(unknown.body.error.message);
  });

  it('logs out by clearing the cookie', async () => {
    const { agent: a } = await registerAgent('USER');
    const out = await a.post('/api/auth/logout');
    expect(out.status).toBe(200);
  });

  it('rejects /me without a token', async () => {
    const res = await agent().get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('exposes Swagger docs and a valid OpenAPI spec', async () => {
    const spec = await agent().get('/openapi.json');
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe('3.0.0');
    expect(Object.keys(spec.body.paths).length).toBeGreaterThan(20);
  });
});
