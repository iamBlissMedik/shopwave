import type { Config } from 'tailwindcss';

/**
 * Shared Tailwind preset for every app in the monorepo.
 *
 * Design tokens live as CSS variables (see ./globals.css) and are exposed here
 * as semantic Tailwind colors. Components only ever reference these names
 * (`bg-surface`, `text-muted`, `border-border`…) — never raw `gray-800` — so
 * light/dark theming and rebrands happen in ONE place, shared by user, merchant
 * and admin.
 *
 * Each app does:
 *   import preset from '@shopwave/config/tailwind';
 *   export default { presets: [preset], content: [...] } satisfies Config;
 *
 * The `rgb(var(--x) / <alpha-value>)` form keeps Tailwind opacity utilities
 * (e.g. `bg-brand/10`) working.
 */
const token = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

// A Tailwind preset (not a full config): apps spread it via `presets: [preset]`
// and supply their own `content` globs.
const preset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: token('--color-background'),
        surface: token('--color-surface'),
        'surface-muted': token('--color-surface-muted'),
        foreground: token('--color-foreground'),
        muted: token('--color-muted'),
        border: token('--color-border'),
        brand: {
          DEFAULT: token('--color-brand'),
          fg: token('--color-brand-fg'),
        },
        success: token('--color-success'),
        warning: token('--color-warning'),
        danger: token('--color-danger'),
        // FunRadar accent families — for badges, tags and chart series. Use with
        // an alpha tint for fills (`bg-accent-teal/15`) and solid for text.
        accent: {
          teal: token('--color-accent-teal'),
          pink: token('--color-accent-pink'),
          amber: token('--color-accent-amber'),
          lime: token('--color-accent-lime'),
        },
      },
      borderColor: {
        DEFAULT: token('--color-border'),
      },
      // Font stacks resolve to the per-app next/font variables (Geist + Nunito
      // Sans), falling back to system fonts. `font-sans` is the default; use
      // `font-display` for headings/marketing type.
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      // Slightly softer corners than Tailwind's defaults for a warmer,
      // less "boxy / AI-generated" feel. Existing `rounded-lg` usages inherit.
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      // Diffuse, low-contrast shadows (cards lift gently rather than hard-drop).
      boxShadow: {
        soft: '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
        card: '0 2px 8px -2px rgb(16 24 40 / 0.06), 0 12px 28px -8px rgb(16 24 40 / 0.10)',
      },
      ringColor: {
        DEFAULT: token('--color-brand'),
      },
    },
  },
  plugins: [],
};

export default preset;
