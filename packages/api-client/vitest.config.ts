import { defineConfig } from 'vitest/config';

// Pure TS package — no DOM needed.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
