/**
 * Seed script — populates a small marketplace:
 *   • 1 admin, 1 customer, 2 merchants (each with a store)
 *   • a catalogue split across the two merchants
 * so every role is usable immediately. Run with: `pnpm db:seed`
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: build a URL-safe slug from a product name.
const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Prices are in cents. `store` picks which merchant owns the product.
const PRODUCTS = [
  {
    store: 'sound',
    name: 'Aurora Wireless Headphones',
    price: 12999,
    category: 'Audio',
    stock: 40,
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
  },
  {
    store: 'sound',
    name: 'Pulse Bluetooth Speaker',
    price: 5999,
    category: 'Audio',
    stock: 60,
    description: 'Compact, water-resistant speaker with deep bass and 12-hour playback.',
  },
  {
    store: 'sound',
    name: 'Drift Noise-Cancelling Earbuds',
    price: 8999,
    category: 'Audio',
    stock: 55,
    description: 'True wireless earbuds with ANC, wireless charging case, and IPX5 rating.',
  },
  {
    store: 'sound',
    name: 'Quartz Smartwatch',
    price: 19999,
    category: 'Wearables',
    stock: 30,
    description: 'Fitness smartwatch with heart-rate, GPS, and a bright AMOLED display.',
  },
  {
    store: 'sound',
    name: 'Halo Fitness Band',
    price: 6999,
    category: 'Wearables',
    stock: 50,
    description: 'Lightweight activity tracker with sleep monitoring and 7-day battery.',
  },
  {
    store: 'sound',
    name: 'Cobalt Power Bank 20K',
    price: 3999,
    category: 'Power',
    stock: 90,
    description: '20,000mAh power bank with fast charging and dual USB-C ports.',
  },
  {
    store: 'gear',
    name: 'Nimbus Mechanical Keyboard',
    price: 8999,
    category: 'Accessories',
    stock: 35,
    description: 'Hot-swappable mechanical keyboard with RGB backlighting and tactile switches.',
  },
  {
    store: 'gear',
    name: 'Vector Ergonomic Mouse',
    price: 4499,
    category: 'Accessories',
    stock: 80,
    description: 'Wireless ergonomic mouse with adjustable DPI and silent clicks.',
  },
  {
    store: 'gear',
    name: 'Lumen 4K Webcam',
    price: 7499,
    category: 'Accessories',
    stock: 25,
    description: '4K UHD webcam with auto-focus and built-in noise-cancelling mic.',
  },
  {
    store: 'gear',
    name: 'Orbit USB-C Hub',
    price: 5499,
    category: 'Accessories',
    stock: 70,
    description: '7-in-1 USB-C hub with HDMI, card reader, and 100W power delivery.',
  },
  {
    store: 'gear',
    name: 'Zephyr Laptop Stand',
    price: 3499,
    category: 'Office',
    stock: 100,
    description: 'Aluminium adjustable laptop stand for better posture and cooling.',
  },
  {
    store: 'gear',
    name: 'Beacon Desk Lamp',
    price: 4299,
    category: 'Office',
    stock: 45,
    description: 'LED desk lamp with adjustable color temperature and wireless charging base.',
  },
  {
    store: 'gear',
    name: 'Forge Gaming Chair',
    price: 24999,
    category: 'Furniture',
    stock: 15,
    description: 'Ergonomic gaming chair with lumbar support and reclining backrest.',
  },
  {
    store: 'gear',
    name: 'Slate Standing Desk',
    price: 39999,
    category: 'Furniture',
    stock: 12,
    description: 'Electric height-adjustable standing desk with memory presets.',
  },
  {
    store: 'gear',
    name: 'Pixel 27" Monitor',
    price: 29999,
    category: 'Displays',
    stock: 20,
    description: '27-inch QHD IPS monitor with 165Hz refresh rate and thin bezels.',
  },
  {
    store: 'gear',
    name: 'Cinema 34" Ultrawide',
    price: 54999,
    category: 'Displays',
    stock: 10,
    description: '34-inch curved ultrawide monitor, perfect for multitasking and gaming.',
  },
];

async function main() {
  console.log('🌱 Seeding database…');

  // Idempotent: clear existing data so re-running gives a clean state.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // --- Users (one per role) ---
  await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@example.com',
      password: await hash('Admin123!'),
      role: 'ADMIN',
    },
  });
  await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'user@example.com',
      password: await hash('User1234!'),
      role: 'USER',
      cart: { create: {} },
    },
  });
  const soundMerchant = await prisma.user.create({
    data: {
      name: 'Sasha (SoundHub)',
      email: 'sound@example.com',
      password: await hash('Merchant1!'),
      role: 'MERCHANT',
      storeName: 'SoundHub Audio',
    },
  });
  const gearMerchant = await prisma.user.create({
    data: {
      name: 'Gabe (GearStop)',
      email: 'gear@example.com',
      password: await hash('Merchant1!'),
      role: 'MERCHANT',
      storeName: 'GearStop Supplies',
    },
  });

  const merchantByStore: Record<string, string> = {
    sound: soundMerchant.id,
    gear: gearMerchant.id,
  };

  // --- Products owned by the merchants ---
  await prisma.product.createMany({
    data: PRODUCTS.map((p, i) => ({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: p.stock,
      slug: slugify(p.name),
      imageUrl: `https://picsum.photos/seed/shopwave-${i + 1}/600/600`,
      merchantId: merchantByStore[p.store]!,
    })),
  });

  console.log(`✅ Seeded ${PRODUCTS.length} products across 2 stores and 4 users`);
  console.log('   Admin    → admin@example.com / Admin123!');
  console.log('   Customer → user@example.com  / User1234!');
  console.log('   Merchant → sound@example.com / Merchant1!  (SoundHub Audio)');
  console.log('   Merchant → gear@example.com  / Merchant1!  (GearStop Supplies)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
