import { describe, it, expect, beforeEach } from 'vitest';
import { agent, registerAgent, createProduct, resetDb } from './helpers';

describe('Products (public catalogue)', () => {
  beforeEach(resetDb);

  async function seedCatalogue() {
    const { agent: merchant } = await registerAgent('MERCHANT');
    await createProduct(merchant, { name: 'Alpha Drill', category: 'Tools', price: 5000 });
    await createProduct(merchant, { name: 'Beta Hammer', category: 'Tools', price: 1500 });
    await createProduct(merchant, { name: 'Gamma Speaker', category: 'Audio', price: 9000 });
    return merchant;
  }

  it('lists products with pagination metadata', async () => {
    await seedCatalogue();
    const res = await agent().get('/api/products?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ total: 3, limit: 2, hasNextPage: true });
  });

  it('filters by category', async () => {
    await seedCatalogue();
    const res = await agent().get('/api/products?category=Audio');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Gamma Speaker');
  });

  it('sorts by price ascending', async () => {
    await seedCatalogue();
    const res = await agent().get('/api/products?sort=price_asc');
    const prices = res.body.data.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('returns a single product by id', async () => {
    const { agent: merchant } = await registerAgent('MERCHANT');
    const p = await createProduct(merchant, { name: 'Solo Item' });
    const res = await agent().get(`/api/products/${p.id}`);
    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Solo Item');
  });

  it('404s for an unknown product', async () => {
    const res = await agent().get('/api/products/does-not-exist');
    expect(res.status).toBe(404);
  });
});
