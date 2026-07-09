import { z } from 'zod';

/**
 * Client-side form schemas. These intentionally mirror the server's Zod schemas
 * so the user gets instant feedback, but the server re-validates everything —
 * client validation is a UX convenience, never a security boundary.
 *
 * Shared from @shopwave/types so all three apps validate identically.
 */
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['USER', 'MERCHANT']),
    storeName: z.string().optional(),
  })
  .refine((d) => d.role !== 'MERCHANT' || (d.storeName?.trim().length ?? 0) >= 2, {
    message: 'Store name is required (min 2 characters)',
    path: ['storeName'],
  });

/** Product create/edit form. Price is entered in dollars and converted to cents. */
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().min(10, 'Describe the product (min 10 characters)').max(2000),
  // Dollars in the form; we multiply by 100 before sending.
  priceDollars: z.coerce.number().positive('Price must be greater than 0'),
  category: z.string().min(2, 'Category is required').max(60),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProductValues = z.infer<typeof productSchema>;
