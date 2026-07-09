import { z } from 'zod';

/**
 * Query schema for `GET /products`.
 * Note `z.coerce.*` — query-string values are always strings, so we coerce
 * them into numbers and provide sensible defaults/bounds.
 */
export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    // Free-text search across name/description.
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    // Price filters are in cents to match storage.
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// Body for a merchant/admin creating a product. Money comes in as cents.
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(2000),
    price: z.coerce.number().int().min(0, 'Price must be a positive amount in cents'),
    category: z.string().trim().min(2).max(60),
    stock: z.coerce.number().int().min(0).default(0),
    imageUrl: z.string().url().optional(),
  }),
});

// All fields optional on update (PATCH semantics), plus isActive toggle.
export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      name: z.string().trim().min(2).max(120),
      description: z.string().trim().min(10).max(2000),
      price: z.coerce.number().int().min(0),
      category: z.string().trim().min(2).max(60),
      stock: z.coerce.number().int().min(0),
      imageUrl: z.string().url(),
      isActive: z.boolean(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' }),
});

export const listMineSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    search: z.string().trim().optional(),
  }),
});

export type ListProductsQuery = z.infer<typeof listProductsSchema>['query'];
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListMineQuery = z.infer<typeof listMineSchema>['query'];
