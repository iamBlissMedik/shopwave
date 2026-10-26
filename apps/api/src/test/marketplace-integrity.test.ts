import { describe, it, expect, beforeEach } from 'vitest';
import { agent, registerAgent, adminAgent, createProduct, resetDb } from './helpers';

/**
 * Marketplace-integrity guarantees that aren't covered by the happy-path suites:
 * historical orders are immutable, merchants are isolated from each other, and an
 * admin role change actually grants/revokes access. These lock in behaviours the
 * TEST-PLAN flagged as follow-ups (TC-CHK-05, TC-MER-05, TC-ADM-03).
 */
describe('Marketplace integrity', () => {
  beforeEach(resetDb);

  describe('Price-snapshot immutability (TC-CHK-05)', () => {
    it('keeps an order line at its purchase-time price after the product price changes', async () => {
      const { agent: merchant } = await registerAgent('MERCHANT');
      const product = await createProduct(merchant, { price: 2000, stock: 5 });
      const { agent: user } = await registerAgent('USER');

      // Buy 2 @ 2000 → order total 4000.
      await user.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(200);
      const checkout = await user.post('/api/orders/checkout');
      const orderId = checkout.body.order.id as string;
      expect(checkout.body.order.total).toBe(4000);
      expect(checkout.body.order.items[0].price).toBe(2000);

      // Merchant later raises the price dramatically.
      const bump = await merchant
        .patch(`/api/merchant/products/${product.id}`)
        .send({ price: 9999 });
      expect(bump.status).toBe(200);
      expect(bump.body.product.price).toBe(9999);

      // The historical order is unchanged — snapshot price + total stay put.
      const fetched = await user.get(`/api/orders/${orderId}`);
      expect(fetched.status).toBe(200);
      expect(fetched.body.order.total).toBe(4000);
      expect(fetched.body.order.items[0].price).toBe(2000);
    });
  });

  describe('Cross-merchant isolation (TC-MER-05)', () => {
    it("forbids a merchant from reading, editing or deleting another merchant's product (403)", async () => {
      const { agent: alice } = await registerAgent('MERCHANT');
      const product = await createProduct(alice, { name: "Alice's Widget", price: 1500 });

      const { agent: bob } = await registerAgent('MERCHANT');
      expect((await bob.get(`/api/merchant/products/${product.id}`)).status).toBe(403);
      expect(
        (await bob.patch(`/api/merchant/products/${product.id}`).send({ price: 1 })).status,
      ).toBe(403);
      expect((await bob.delete(`/api/merchant/products/${product.id}`)).status).toBe(403);

      // Alice's product is untouched by Bob's attempts.
      const stillOwned = await alice.get(`/api/merchant/products/${product.id}`);
      expect(stillOwned.status).toBe(200);
      expect(stillOwned.body.product.price).toBe(1500);
    });
  });

  describe('Admin role change takes effect (TC-ADM-03)', () => {
    it('grants merchant access after an admin promotes a USER (effective on next login)', async () => {
      const { agent: user, res, email, password } = await registerAgent('USER');
      const userId = res.body.user.id as string;

      // As a USER, the merchant dashboard is forbidden.
      expect((await user.get('/api/merchant/stats')).status).toBe(403);

      // Admin promotes them to MERCHANT.
      const { agent: admin } = await adminAgent();
      const promote = await admin
        .patch(`/api/admin/users/${userId}/role`)
        .send({ role: 'MERCHANT' });
      expect(promote.status).toBe(200);

      // The role lives in the JWT, so the *existing* session still reads as USER
      // until the token is refreshed — a deliberate stateless-auth tradeoff.
      expect((await user.get('/api/merchant/stats')).status).toBe(403);

      // Re-logging in mints a token with the new role → merchant access granted.
      const fresh = agent();
      await fresh.post('/api/auth/login').send({ email, password });
      expect((await fresh.get('/api/auth/me')).body.user.role).toBe('MERCHANT');
      expect((await fresh.get('/api/merchant/stats')).status).toBe(200);
    });
  });
});
