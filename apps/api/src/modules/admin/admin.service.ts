import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { buildPaginatedResult, toSkipTake } from '../../utils/pagination';
import { buildDailySeries } from '../../utils/series';

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  storeName: true,
  createdAt: true,
  _count: { select: { products: true, orders: true } },
} satisfies Prisma.UserSelect;

/** Paginated, filterable user directory. */
export async function listUsers(params: {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
}) {
  const where: Prisma.UserWhereInput = {};
  if (params.role) where.role = params.role;
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const { skip, take } = toSkipTake({ page: params.page, limit: params.limit });
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userPublicSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  return buildPaginatedResult(users, total, { page: params.page, limit: params.limit });
}

/** Promote/demote a user. Guards against an admin locking themselves out. */
export async function updateUserRole(adminId: string, userId: string, role: Role) {
  if (adminId === userId) throw ApiError.badRequest('You cannot change your own role');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  return prisma.user.update({ where: { id: userId }, data: { role }, select: userPublicSelect });
}

export async function deleteUser(adminId: string, userId: string) {
  if (adminId === userId) throw ApiError.badRequest('You cannot delete your own account');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    // FK restriction — e.g. a merchant whose products are in existing orders.
    throw ApiError.conflict('User has linked orders/products and cannot be deleted');
  }
  return { id: userId, deleted: true };
}

/** Catalogue-wide moderation list (every merchant's products). */
export async function listAllProducts(params: {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive';
}) {
  const where: Prisma.ProductWhereInput = {};
  if (params.status) where.isActive = params.status === 'active';
  if (params.search) where.name = { contains: params.search, mode: 'insensitive' };

  const { skip, take } = toSkipTake({ page: params.page, limit: params.limit });
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { merchant: { select: { id: true, name: true, storeName: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);
  return buildPaginatedResult(products, total, { page: params.page, limit: params.limit });
}

/** Platform-wide dashboard: headline numbers + chart series. */
export async function getStats() {
  // The revenue chart only needs the last 14 days, so scope that query to the
  // window instead of loading every paid order (totals come from `revenueAgg`).
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const [users, merchants, products, orders, revenueAgg, paidOrders, usersByRole] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MERCHANT' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
      prisma.order.findMany({
        where: { status: 'PAID', createdAt: { gte: since } },
        select: { total: true, createdAt: true },
      }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    ]);

  const revenueByDay = buildDailySeries(
    paidOrders.map((o) => ({ date: o.createdAt, value: o.total })),
    14,
  );

  return {
    totals: {
      users,
      merchants,
      products,
      orders,
      revenue: revenueAgg._sum.total ?? 0,
    },
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
    revenueByDay,
  };
}
