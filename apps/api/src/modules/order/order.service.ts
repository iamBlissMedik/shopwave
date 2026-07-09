import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { buildPaginatedResult, toSkipTake } from '../../utils/pagination';

const ORDER_INCLUDE = { items: { include: { product: true } } } as const;

/**
 * Turn the current cart into an order.
 *
 * Atomic transaction: either the order is created AND stock is decremented AND
 * the cart is cleared, or nothing happens — no overselling, no partial orders.
 *
 * Two safeguards worth calling out:
 *  - **Guarded decrement.** Stock is decremented with a conditional
 *    `updateMany … where stock >= qty`; if it affects 0 rows, someone else took
 *    the last unit, so we roll back. This is race-proof with no read-then-write
 *    gap (no reliance on row locks / isolation level).
 *  - **Idempotency.** An optional client key makes a retried checkout return the
 *    original order instead of creating a duplicate; the unique constraint also
 *    settles a concurrent double-submit (the loser returns the winner's order).
 */
export async function checkout(userId: string, idempotencyKey?: string) {
  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: ORDER_INCLUDE,
    });
    if (existing && existing.userId === userId) return existing;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest('Your cart is empty');
      }

      const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

      // Guarded, race-proof stock decrement (see doc comment above).
      for (const item of cart.items) {
        const res = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (res.count === 0) {
          throw ApiError.badRequest(`Not enough stock for "${item.product.name}"`);
        }
      }

      // Create the order with a price snapshot per line.
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PAID', // MVP: we assume payment succeeded synchronously.
          idempotencyKey,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              price: i.product.price,
              quantity: i.quantity,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  } catch (err) {
    // Concurrent double-submit with the same key: the loser hits the unique
    // constraint. Return the winner's order — but only if it's the same user.
    if (idempotencyKey && err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: ORDER_INCLUDE,
      });
      if (existing && existing.userId === userId) return existing;
      throw ApiError.conflict('This idempotency key was already used');
    }
    throw err;
  }
}

export async function listOrders(userId: string, page: number, limit: number) {
  const { skip, take } = toSkipTake({ page, limit });
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return buildPaginatedResult(orders, total, { page, limit });
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId }, // scope to owner — users can't read others' orders
    include: { items: { include: { product: true } } },
  });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}
