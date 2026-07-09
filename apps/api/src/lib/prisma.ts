import { PrismaClient } from '@prisma/client';
import { isProd } from '../config/env';

/**
 * A single shared PrismaClient instance.
 * In dev, `tsx watch` reloads modules frequently; caching the client on
 * `globalThis` prevents exhausting the database connection pool with a new
 * client on every reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['warn', 'error'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
