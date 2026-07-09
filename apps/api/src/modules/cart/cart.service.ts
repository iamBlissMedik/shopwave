import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

/**
 * A cart belongs to either a logged-in user or an anonymous guest session.
 * Every cart operation takes this descriptor so the same logic serves both.
 */
export type CartOwner = { userId: string } | { sessionId: string };

/** The unique `where` that identifies this owner's cart. */
function ownerWhere(owner: CartOwner): Prisma.CartWhereUniqueInput {
  return 'userId' in owner ? { userId: owner.userId } : { sessionId: owner.sessionId };
}

/** Ensure the owner has a cart row and return its id. */
async function getOrCreateCartId(owner: CartOwner, tx: Prisma.TransactionClient = prisma): Promise<string> {
  const cart = await tx.cart.upsert({
    where: ownerWhere(owner),
    update: {},
    create: owner, // { userId } or { sessionId }
    select: { id: true },
  });
  return cart.id;
}

/**
 * Return the owner's cart with line items, each enriched with its product and a
 * computed `lineTotal`, plus the overall `subtotal` and item count.
 * All money is in cents.
 */
export async function getCart(owner: CartOwner) {
  const cartId = await getOrCreateCartId(owner);

  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  });

  const lines = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: item.product,
    lineTotal: item.product.price * item.quantity,
  }));

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { items: lines, subtotal, itemCount };
}

export async function addToCart(owner: CartOwner, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');

  const cartId = await getOrCreateCartId(owner);

  // Read current quantity (if any) for a best-effort stock check on the new
  // total. This check is advisory — adding to cart never decrements stock, so
  // the authoritative oversell guard is the atomic checkout transaction. We
  // keep it only to give immediate feedback ("only N in stock").
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  if (newQuantity > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} unit(s) of "${product.name}" in stock`);
  }

  // Upsert with a DB-level atomic `increment` (not an absolute set). This is the
  // important bit: two concurrent adds of the same item both accumulate instead
  // of one silently overwriting the other (lost update).
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId, productId, quantity },
  });

  return getCart(owner);
}

export async function updateItem(owner: CartOwner, productId: string, quantity: number) {
  const cartId = await getOrCreateCartId(owner);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product not found');
  if (quantity > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} unit(s) of "${product.name}" in stock`);
  }

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
  if (!item) throw ApiError.notFound('Item is not in your cart');

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId, productId } },
    data: { quantity },
  });

  return getCart(owner);
}

export async function removeItem(owner: CartOwner, productId: string) {
  const cartId = await getOrCreateCartId(owner);
  await prisma.cartItem
    .delete({ where: { cartId_productId: { cartId, productId } } })
    .catch(() => {
      throw ApiError.notFound('Item is not in your cart');
    });
  return getCart(owner);
}

export async function clearCart(owner: CartOwner) {
  const cartId = await getOrCreateCartId(owner);
  await prisma.cartItem.deleteMany({ where: { cartId } });
  return getCart(owner);
}

/**
 * Merge an anonymous guest cart into a user's cart on login/register, then
 * discard the guest cart. Quantities are summed and clamped to current stock;
 * inactive/deleted products are skipped. Runs in one transaction so a partial
 * merge can never strand items in both carts.
 */
export async function mergeGuestCart(userId: string, sessionId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const guest = await tx.cart.findUnique({
      where: { sessionId },
      include: { items: { include: { product: true } } },
    });
    if (!guest) return;

    if (guest.items.length > 0) {
      const userCartId = await getOrCreateCartId({ userId }, tx);
      for (const item of guest.items) {
        if (!item.product.isActive) continue;
        const existing = await tx.cartItem.findUnique({
          where: { cartId_productId: { cartId: userCartId, productId: item.productId } },
        });
        const merged = Math.min((existing?.quantity ?? 0) + item.quantity, item.product.stock);
        if (merged <= 0) continue;
        await tx.cartItem.upsert({
          where: { cartId_productId: { cartId: userCartId, productId: item.productId } },
          update: { quantity: merged },
          create: { cartId: userCartId, productId: item.productId, quantity: merged },
        });
      }
    }

    // Drop the guest cart (cascade removes its items).
    await tx.cart.delete({ where: { id: guest.id } });
  });
}
