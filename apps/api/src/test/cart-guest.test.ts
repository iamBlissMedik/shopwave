import { describe, it, expect, beforeEach } from 'vitest';
import { agent, registerAgent, createProduct, resetDb } from './helpers';

/**
 * Guest carts: anonymous shoppers get a server-side cart keyed by an httpOnly
 * session cookie, which is merged into their account cart on login/register.
 * supertest's `request.agent` persists cookies between requests, so a single
 * agent simulates one browser carrying its guest-session (and later auth) cookie.
 */
describe('Guest cart', () => {
  beforeEach(resetDb);

  it('lets an anonymous visitor add to a cart and read it back (no login)', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 10, price: 1500 });

    const guest = agent(); // no auth cookie
    const added = await guest.post('/api/cart/items').send({ productId: product.id, quantity: 2 });
    expect(added.status).toBe(200);
    expect(added.body.cart.itemCount).toBe(2);

    // The session cookie persists the same cart across requests.
    const fetched = await guest.get('/api/cart');
    expect(fetched.body.cart.itemCount).toBe(2);
    expect(fetched.body.cart.subtotal).toBe(3000);
  });

  it('keeps separate guest carts isolated per session', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 10 });

    const a = agent();
    const b = agent();
    await a.post('/api/cart/items').send({ productId: product.id, quantity: 1 });

    // b never added anything → its own empty cart.
    expect((await b.get('/api/cart')).body.cart.itemCount).toBe(0);
    expect((await a.get('/api/cart')).body.cart.itemCount).toBe(1);
  });

  it('merges the guest cart into the account cart on login (summing quantities)', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 10, price: 1000 });

    // Customer exists and already has 1 of the product in their account cart.
    const { email, password } = await registerAgent('USER', { email: 'shopper@example.com' });
    const loggedIn = agent();
    await loggedIn.post('/api/auth/login').send({ email, password });
    await loggedIn.post('/api/cart/items').send({ productId: product.id, quantity: 1 });

    // Same browser, but now browsing as a guest (fresh agent) adds 2 more.
    const browser = agent();
    await browser.post('/api/cart/items').send({ productId: product.id, quantity: 2 });

    // Then they log in on that browser → guest cart merges into the account cart.
    const after = await browser.post('/api/auth/login').send({ email, password });
    expect(after.status).toBe(200);

    const merged = await browser.get('/api/cart');
    expect(merged.body.cart.items).toHaveLength(1);
    expect(merged.body.cart.itemCount).toBe(3); // 1 (account) + 2 (guest)
  });

  it('clamps the merged quantity to available stock', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 4, price: 1000 });
    const { email, password } = await registerAgent('USER', { email: 'clamp@example.com' });

    // Guest piles in more than exists; merge clamps to stock (4).
    const browser = agent();
    await browser.post('/api/cart/items').send({ productId: product.id, quantity: 4 });
    await browser.post('/api/auth/login').send({ email, password });

    const merged = await browser.get('/api/cart');
    expect(merged.body.cart.itemCount).toBe(4);
  });
});
