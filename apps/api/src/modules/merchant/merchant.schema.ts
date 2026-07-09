import { z } from 'zod';

/** Pagination for the merchant's sales (order-item) feed. */
export const listSalesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

// Product create/update bodies are reused from the product module's schemas.
export { createProductSchema, updateProductSchema, listMineSchema } from '../product/product.schema';
