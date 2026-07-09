import type { Config } from 'tailwindcss';
import preset from '@shopwave/config/tailwind';

/**
 * App Tailwind config: inherits the shared design-token preset and scans this
 * app plus every shared package whose components ship token classes.
 */
export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/hooks/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
