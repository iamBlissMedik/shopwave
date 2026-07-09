import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().optional(),
    role: z.enum(['USER', 'MERCHANT', 'ADMIN']).optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ role: z.enum(['USER', 'MERCHANT', 'ADMIN']) }),
});

export const userIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listAllProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().optional(),
    // Tri-state visibility filter for moderation.
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
