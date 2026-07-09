import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(60),
      email: z.string().email('A valid email is required').toLowerCase(),
      password: z.string().min(8, 'Password must be at least 8 characters').max(72),
      // Self-service signup is limited to customers and merchants.
      // ADMIN accounts are created via the seed or promoted by another admin.
      role: z.enum(['USER', 'MERCHANT']).default('USER'),
      storeName: z.string().trim().min(2).max(80).optional(),
    })
    // A merchant must name their store.
    .refine((d) => d.role !== 'MERCHANT' || !!d.storeName, {
      message: 'Store name is required for merchant accounts',
      path: ['storeName'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
