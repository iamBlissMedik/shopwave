import { describe, it, expect, beforeEach } from 'vitest';
import { agent, registerAgent, adminAgent, createProduct, resetDb } from './helpers';

/**
 * Functional coverage for the merchant dashboard and admin console endpoints —
 * the happy paths (stats, listings, sales, moderation, user management) that the
 * access-control suite only probes for authorization.
 */
describe('Merchant dashboard', () => {
  beforeEach(resetDb);

  it('lists only the calling merchant’s own products', async () => {
    const { agent: alice } = await registerAgent('MERCHANT');
    await createProduct(alice, { name: 'Alice One' });
    await createProduct(alice, { name: 'Alice Two' });
    const { agent: bob } = await registerAgent('MERCHANT');
    await createProduct(bob, { name: 'Bob One' });

    const res = await alice.get('/api/merchant/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((p: { name: string }) => p.name.startsWith('Alice'))).toBe(true);
    expect(res.body.meta.total).toBe(2);
  });

  it('reports dashboard stats reflecting real sales', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { price: 2500, stock: 10 });
    const { agent: user } = await registerAgent('USER');
    await user.post('/api/cart/items').send({ productId: product.id, quantity: 2 });
    await user.post('/api/orders/checkout');

    const res = await merchant.get('/api/merchant/stats');
    expect(res.status).toBe(200);
    expect(res.body.totals).toMatchObject({ totalProducts: 1, activeProducts: 1, unitsSold: 2, totalRevenue: 5000 });
    expect(Array.isArray(res.body.revenueByDay)).toBe(true);
    expect(res.body.topProducts[0]).toMatchObject({ revenue: 5000 });
  });

  it('shows a merchant only their own line items in the sales feed', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { price: 1000, stock: 5 });
    const { agent: user } = await registerAgent('USER');
    await user.post('/api/cart/items').send({ productId: product.id, quantity: 3 });
    await user.post('/api/orders/checkout');

    const res = await merchant.get('/api/merchant/sales');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ quantity: 3, revenue: 3000 });
  });
});

describe('Admin console', () => {
  beforeEach(resetDb);

  it('aggregates platform-wide stats', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { price: 4000, stock: 10 });
    const { agent: user } = await registerAgent('USER');
    await user.post('/api/cart/items').send({ productId: product.id, quantity: 1 });
    await user.post('/api/orders/checkout');

    const { agent: admin } = await adminAgent();
    const res = await admin.get('/api/admin/stats');
    expect(res.status).toBe(200);
    expect(res.body.totals).toMatchObject({ merchants: 1, products: 1, orders: 1, revenue: 4000 });
    expect(res.body.totals.users).toBeGreaterThanOrEqual(3); // merchant + user + admin
    expect(Array.isArray(res.body.usersByRole)).toBe(true);
  });

  it('lists and filters users by role', async () => {
    await registerAgent('USER');
    await registerAgent('MERCHANT');
    const { agent: admin } = await adminAgent();

    const all = await admin.get('/api/admin/users');
    expect(all.status).toBe(200);
    expect(all.body.meta.total).toBeGreaterThanOrEqual(3);

    const merchants = await admin.get('/api/admin/users?role=MERCHANT');
    expect(merchants.body.data.every((u: { role: string }) => u.role === 'MERCHANT')).toBe(true);
  });

  it('moderates a product, hiding it from the public catalogue', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { name: 'Spicy Listing' });
    const { agent: admin } = await adminAgent();

    // Visible publicly before moderation.
    const before = await agent().get('/api/products');
    expect(before.body.data.some((p: { id: string }) => p.id === product.id)).toBe(true);

    const mod = await admin.patch(`/api/admin/products/${product.id}`).send({ isActive: false });
    expect(mod.status).toBe(200);
    expect(mod.body.product.isActive).toBe(false);

    // Hidden from the public catalogue afterwards.
    const after = await agent().get('/api/products');
    expect(after.body.data.some((p: { id: string }) => p.id === product.id)).toBe(false);
  });

  it('deletes a user but refuses to delete itself', async () => {
    const { res } = await registerAgent('USER');
    const userId = res.body.user.id as string;
    const { agent: admin, email } = await adminAgent();

    const del = await admin.delete(`/api/admin/users/${userId}`);
    expect(del.status).toBe(200);

    // Find the admin's own id and try to self-delete → 400.
    const adminRow = (await admin.get('/api/admin/users?search=' + encodeURIComponent(email))).body.data[0];
    const self = await admin.delete(`/api/admin/users/${adminRow.id}`);
    expect(self.status).toBe(400);
  });
});
