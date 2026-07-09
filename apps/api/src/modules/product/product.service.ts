import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { buildPaginatedResult, toSkipTake } from '../../utils/pagination';
import type {
  CreateProductInput,
  ListMineQuery,
  ListProductsQuery,
  UpdateProductInput,
} from './product.schema';

/** Identifies who is performing a write — used for ownership checks. */
export interface Actor {
  id: string;
  role: Role;
}

// Public product responses include a lightweight view of the selling store.
const merchantSelect = { select: { id: true, name: true, storeName: true } };

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ----------------------------------------------------------------------------
// Public catalogue (customer-facing)
// ----------------------------------------------------------------------------

/** Translate the validated query into a Prisma `where` + `orderBy`. */
function buildQuery(q: ListProductsQuery) {
  // Customers only ever see active products.
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (q.search) {
    where.OR = [
      { name: { contains: q.search, mode: 'insensitive' } },
      { description: { contains: q.search, mode: 'insensitive' } },
    ];
  }
  if (q.category) where.category = q.category;

  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = {
      ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}),
      ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    newest: { createdAt: 'desc' as const },
    price_asc: { price: 'asc' as const },
    price_desc: { price: 'desc' as const },
    name_asc: { name: 'asc' as const },
  }[q.sort];

  return { where, orderBy };
}

export async function listProducts(q: ListProductsQuery) {
  const { where, orderBy } = buildQuery(q);
  const { skip, take } = toSkipTake({ page: q.page, limit: q.limit });

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take, include: { merchant: merchantSelect } }),
    prisma.product.count({ where }),
  ]);

  return buildPaginatedResult(products, total, { page: q.page, limit: q.limit });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: { merchant: merchantSelect },
  });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

/** Distinct category list (active products only) for the storefront filter. */
export async function listCategories() {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });
  return rows.map((r) => r.category);
}

// ----------------------------------------------------------------------------
// Ownership-scoped writes (merchant + admin)
// ----------------------------------------------------------------------------

/**
 * Load a product and assert the actor may modify it.
 * Admins may touch anything; merchants only their own products.
 */
async function loadOwned(actor: Actor, id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound('Product not found');
  if (actor.role !== 'ADMIN' && product.merchantId !== actor.id) {
    throw ApiError.forbidden('You can only manage your own products');
  }
  return product;
}

/** Fetch a single product the actor owns (for the edit form). */
export async function getOwnedProduct(actor: Actor, id: string) {
  return loadOwned(actor, id);
}

/** Generate a slug that is unique even if two products share a name. */
async function uniqueSlug(name: string) {
  const base = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createProduct(actor: Actor, input: CreateProductInput) {
  const slug = await uniqueSlug(input.name);
  return prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      stock: input.stock,
      slug,
      imageUrl: input.imageUrl ?? `https://picsum.photos/seed/${slug}/600/600`,
      merchantId: actor.id, // the creator owns it
    },
    include: { merchant: merchantSelect },
  });
}

export async function updateProduct(actor: Actor, id: string, input: UpdateProductInput) {
  await loadOwned(actor, id);
  return prisma.product.update({
    where: { id },
    data: input,
    include: { merchant: merchantSelect },
  });
}

/** Soft delete: hide the product but keep order history intact. */
export async function deleteProduct(actor: Actor, id: string) {
  await loadOwned(actor, id);
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return { id, deleted: true };
}

/** A single merchant's full catalogue (active AND inactive). */
export async function listByMerchant(merchantId: string, q: ListMineQuery) {
  const where: Prisma.ProductWhereInput = { merchantId };
  if (q.search) where.name = { contains: q.search, mode: 'insensitive' };

  const { skip, take } = toSkipTake({ page: q.page, limit: q.limit });
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.product.count({ where }),
  ]);
  return buildPaginatedResult(products, total, { page: q.page, limit: q.limit });
}
