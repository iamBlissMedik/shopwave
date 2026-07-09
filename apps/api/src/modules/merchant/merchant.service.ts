import { prisma } from '../../lib/prisma';
import { buildPaginatedResult, toSkipTake } from '../../utils/pagination';
import { buildDailySeries } from '../../utils/series';

/**
 * Sales = order items whose product belongs to this merchant.
 * Because a single customer order can span multiple merchants, each merchant
 * sees only their own line items (not the whole order).
 */
export async function listSales(merchantId: string, page: number, limit: number) {
  const where = { product: { merchantId } };
  const { skip, take } = toSkipTake({ page, limit });

  const [items, total] = await Promise.all([
    prisma.orderItem.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        order: { select: { id: true, status: true, createdAt: true, user: { select: { name: true } } } },
      },
      orderBy: { order: { createdAt: 'desc' } },
      skip,
      take,
    }),
    prisma.orderItem.count({ where }),
  ]);

  const sales = items.map((i) => ({
    id: i.id,
    orderId: i.orderId,
    product: i.product,
    quantity: i.quantity,
    revenue: i.price * i.quantity,
    customerName: i.order.user.name,
    status: i.order.status,
    createdAt: i.order.createdAt,
  }));

  return buildPaginatedResult(sales, total, { page, limit });
}

/**
 * Dashboard metrics + chart series for a merchant. Every query is bounded:
 * counts are indexed, revenue/units and the top-5 are SQL aggregates (we can't
 * `SUM(price * quantity)` through Prisma's aggregate API), and the chart only
 * pulls the last 14 days — so this never loads a merchant's whole sales history
 * into memory.
 */
export async function getStats(merchantId: string) {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [totalProducts, activeProducts, lowStock, totalsRows, topRows, recent] = await Promise.all([
    prisma.product.count({ where: { merchantId } }),
    prisma.product.count({ where: { merchantId, isActive: true } }),
    prisma.product.count({ where: { merchantId, isActive: true, stock: { lte: 5 } } }),
    // All-time revenue + units sold, as a single aggregate.
    prisma.$queryRaw<{ revenue: bigint; units: bigint }[]>`
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
             COALESCE(SUM(oi.quantity), 0) AS units
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE p."merchantId" = ${merchantId} AND o.status = 'PAID'::"OrderStatus"`,
    // Top 5 products by all-time revenue.
    prisma.$queryRaw<{ name: string; revenue: bigint }[]>`
      SELECT p.name AS name, SUM(oi.price * oi.quantity) AS revenue
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE p."merchantId" = ${merchantId} AND o.status = 'PAID'::"OrderStatus"
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 5`,
    // Only the last 14 days are needed for the chart.
    prisma.orderItem.findMany({
      where: { product: { merchantId }, order: { status: 'PAID', createdAt: { gte: since } } },
      select: { price: true, quantity: true, order: { select: { createdAt: true } } },
    }),
  ]);

  const totalRevenue = Number(totalsRows[0]?.revenue ?? 0);
  const unitsSold = Number(totalsRows[0]?.units ?? 0);
  const topProducts = topRows.map((r) => ({ name: r.name, revenue: Number(r.revenue) }));
  const revenueByDay = buildDailySeries(
    recent.map((i) => ({ date: i.order.createdAt, value: i.price * i.quantity })),
    14,
  );

  return {
    totals: { totalProducts, activeProducts, lowStock, unitsSold, totalRevenue },
    revenueByDay,
    topProducts,
  };
}
