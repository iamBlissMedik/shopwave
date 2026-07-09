import { describe, it, expect, beforeEach } from 'vitest';
import { agent, registerAgent, createProduct, resetDb } from './helpers';

describe('Cart & checkout (the money path)', () => {
  beforeEach(resetDb);

  it('adds, updates and removes cart items, returning the fresh cart each time', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 10, price: 2000 });
    const { agent: user } = await registerAgent('USER');

    const added = await user.post('/api/cart/items').send({ productId: product.id, quantity: 2 });
    expect(added.status).toBe(200);
    expect(added.body.cart.itemCount).toBe(2);
    expect(added.body.cart.subtotal).toBe(4000);

    const updated = await user.patch(`/api/cart/items/${product.id}`).send({ quantity: 3 });
    expect(updated.body.cart.itemCount).toBe(3);

    const removed = await user.delete(`/api/cart/items/${product.id}`);
    expect(removed.body.cart.itemCount).toBe(0);
  });

  it('checks out atomically: creates a PAID order and decrements stock', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 5, price: 2500 });
    const { agent: user } = await registerAgent('USER');

    await user.post('/api/cart/items').send({ productId: product.id, quantity: 2 });
    const checkout = await user.post('/api/orders/checkout');
    expect(checkout.status).toBe(201);
    expect(checkout.body.order).toMatchObject({ status: 'PAID', total: 5000 });

    // Stock decremented 5 → 3.
    const after = await agent().get(`/api/products/${product.id}`);
    expect(after.body.product.stock).toBe(3);

    // Cart is emptied after checkout.
    const cart = await user.get('/api/cart');
    expect(cart.body.cart.itemCount).toBe(0);
  });

  it('rejects checkout that would oversell, leaving stock untouched', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 5, price: 1000 });
    const { agent: user } = await registerAgent('USER');

    await user.post('/api/cart/items').send({ productId: product.id, quantity: 3 });
    // Merchant lowers stock below what's in the cart.
    await merchant.patch(`/api/merchant/products/${product.id}`).send({ stock: 2 });

    const checkout = await user.post('/api/orders/checkout');
    expect(checkout.status).toBe(400);

    // No order was created and stock is unchanged.
    const after = await agent().get(`/api/products/${product.id}`);
    expect(after.body.product.stock).toBe(2);
  });

  it('rejects checkout with an empty cart', async () => {
    const { agent: user } = await registerAgent('USER');
    const res = await user.post('/api/orders/checkout');
    expect(res.status).toBe(400);
  });

  it('is idempotent: replaying checkout with the same Idempotency-Key returns the same order', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 10, price: 1000 });
    const { agent: user } = await registerAgent('USER');
    await user.post('/api/cart/items').send({ productId: product.id, quantity: 2 });

    const key = 'idem-key-123';
    const first = await user.post('/api/orders/checkout').set('Idempotency-Key', key);
    expect(first.status).toBe(201);

    // Replay → same order, not a second one.
    const replay = await user.post('/api/orders/checkout').set('Idempotency-Key', key);
    expect(replay.status).toBe(201);
    expect(replay.body.order.id).toBe(first.body.order.id);

    // Stock decremented exactly once (10 → 8), and only one order exists.
    const after = await agent().get(`/api/products/${product.id}`);
    expect(after.body.product.stock).toBe(8);
    expect((await user.get('/api/orders')).body.data).toHaveLength(1);
  });

  it('accumulates repeated adds of the same product into one line (atomic increment)', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const product = await createProduct(merchant, { stock: 50, price: 100 });
    const { agent: user } = await registerAgent('USER');

    await user.post('/api/cart/items').send({ productId: product.id, quantity: 2 });
    const after = await user.post('/api/cart/items').send({ productId: product.id, quantity: 3 });

    // One line item, quantities summed (not overwritten, not duplicated).
    expect(after.body.cart.items).toHaveLength(1);
    expect(after.body.cart.items[0].quantity).toBe(5);
    expect(after.body.cart.itemCount).toBe(5);
  });
});
