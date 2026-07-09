import { defineConfig } from 'tsup';

/**
 * Build the API with esbuild (via tsup) instead of `tsc`. This lets the source
 * use clean, extensionless relative imports (`./foo` rather than `./foo.js`)
 * while still emitting a runnable `dist/index.js`.
 *
 * `format: 'cjs'` keeps the existing CommonJS runtime (the package has no
 * `"type": "module"`), so `node dist/index.js` works exactly as before.
 * Dependencies are left external (resolved from node_modules at runtime) — only
 * our own `src` is bundled, which keeps Prisma's engine resolution working.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
});
