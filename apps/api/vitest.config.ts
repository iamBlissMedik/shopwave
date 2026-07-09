import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Apply migrations to the test DB once before the whole run.
    globalSetup: ['./src/test/globalSetup.ts'],
    // Load the test env (separate DB) before anything imports config/env.
    setupFiles: ['./src/test/setup.ts'],
    // Integration tests share one Postgres DB; run files serially to avoid
    // cross-file data races on the truncate-between-tests strategy.
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
});
