// Loads the test environment (isolated DB) and MUST be imported before anything
// pulls in `config/env.ts`. `override: true` ensures the test DATABASE_URL wins
// over any real `.env` already on disk. Tests always run with cwd = apps/api
// (both `pnpm --filter @shopwave/api test` and Turbo run in the package dir).
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.test'), override: true });
