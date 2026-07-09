import 'dotenv/config';
import { z } from 'zod';

/**
 * Validate environment variables at boot with Zod.
 * If anything is missing/malformed the process exits immediately with a clear
 * message — we never start the server in a half-configured state.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  // Comma-separated allowlist of the frontend origins (user / merchant / admin
  // subdomains). Parsed into an array; only these origins may call the API.
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001,http://localhost:3002')
    .transform((s) =>
      s
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('token'),
  // Cookie holding the anonymous guest-cart session id (pre-login carts).
  CART_COOKIE_NAME: z.string().default('cart_sid'),
  // In production, set to the registrable parent domain (e.g. `.app.com`) so the
  // auth cookie is shared across the user/merchant/admin subdomains. Leave unset
  // for localhost (host-only cookie on the API origin).
  COOKIE_DOMAIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
