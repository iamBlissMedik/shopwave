import { z } from 'zod';

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
