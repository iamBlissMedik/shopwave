import './env';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

/** One app instance shared by all tests. */
export const app = createApp();

/** A cookie-persisting client (keeps the auth cookie between requests). */
export const agent = () => request.agent(app);

/** Wipe every table between tests so each spec starts from a clean slate. */
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "OrderItem","Order","CartItem","Cart","Product","User" RESTART IDENTITY CASCADE',
  );
}

let emailSeq = 0;
const uniqueEmail = (prefix: string) => `${prefix}${emailSeq++}@example.com`;

/** Register a USER/MERCHANT through the real endpoint and return a logged-in agent. */
export async function registerAgent(
  role: 'USER' | 'MERCHANT' = 'USER',
  overrides: Record<string, unknown> = {},
) {
  const a = agent();
  const email = (overrides.email as string) ?? uniqueEmail(role.toLowerCase());
  const body = {
    name: `${role} Tester`,
    email,
    password: 'Password1!',
    role,
    ...(role === 'MERCHANT' ? { storeName: 'Test Store' } : {}),
    ...overrides,
  };
  const res = await a.post('/api/auth/register').send(body);
  return { agent: a, res, email, password: 'Password1!' };
}

/** Seed an ADMIN directly (self-service signup can't create admins) and log in. */
export async function adminAgent() {
  const email = uniqueEmail('admin');
  const password = 'Password1!';
  await prisma.user.create({
    data: { name: 'Admin Tester', email, password: await bcrypt.hash(password, 10), role: 'ADMIN' as Role },
  });
  const a = agent();
  await a.post('/api/auth/login').send({ email, password });
  return { agent: a, email, password };
}

/** Create a product owned by a merchant (via the merchant endpoint). */
export async function createProduct(
  merchant: ReturnType<typeof agent>,
  overrides: Record<string, unknown> = {},
) {
  const res = await merchant.post('/api/merchant/products').send({
    name: 'Test Widget',
    description: 'A solid, dependable test widget for your needs.',
    price: 1999,
    category: 'Tools',
    stock: 10,
    ...overrides,
  });
  return res.body.product as { id: string; stock: number; price: number };
}

export { prisma };
