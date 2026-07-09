import type { Config } from 'tailwindcss';
import preset from '@shopwave/config/tailwind';

/**
 * Tailwind config used ONLY by Storybook (each app has its own that also scans
 * this package). It inherits the shared design-token preset — the exact same one
 * the apps use — so components render identically in Storybook and in the app,
 * with no hand-copied token subset that can drift.
 */
export default {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
