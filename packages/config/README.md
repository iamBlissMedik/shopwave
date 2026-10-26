# @shopwave/config

Shared build & design configuration consumed by every app and package.

| Export | Purpose |
| --- | --- |
| `@shopwave/config/tailwind` | Tailwind **preset** mapping the semantic design tokens (`bg-surface`, `text-muted`, `text-brand`…) onto CSS variables. Apps spread it via `presets: [preset]`. |
| `@shopwave/config/globals.css` | The CSS-variable token values for light/dark themes + base layer. Each app imports this from its own `globals.css`. |
| `@shopwave/config/tsconfig.base.json` | Base TypeScript config every package/app `extends`. |

## Usage

`tailwind.config.ts` in an app:

```ts
import type { Config } from 'tailwindcss';
import preset from '@shopwave/config/tailwind';

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/hooks/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
```

`globals.css` in an app:

```css
@import '@shopwave/config/globals.css';
```

> Changing a brand color or theme token? Do it **here** and all three apps update together.

## Design system

Palette and semantics are derived from the **FunRadar** design system
(`funradar-web-apps/packages/tokens`). Tokens are stored as RGB channel triplets
so Tailwind opacity utilities keep working (`bg-brand/10`, `border-border/60`).

### Semantic color tokens

| Token (utility) | Light | Dark | Source |
| --- | --- | --- | --- |
| `background` | `#fafafa` | `#171717` | grey-50 / grey-950 |
| `surface` | `#ffffff` | `#1c1c1c` | grey-0 / grey-900 |
| `surface-muted` | `#f5f5f5` | `#262626` | grey-100 / grey-800 |
| `foreground` | `#171717` | `#ffffff` | grey-950 / grey-0 |
| `muted` | `#5c5c5c` | `#a3a3a3` | grey-600 / grey-400 |
| `border` | `#ebebeb` | `#333333` | grey-200 / grey-700 |
| `brand` / `brand-fg` | `#4f1cc9` / white | `#9a86ff` / `#171717` | brand-500 / brand-400 |
| `success` | `#1fc16b` | `#3ee089` | success-500 / 400 |
| `warning` | `#fa7319` | `#ffa468` | warning-500 / 400 |
| `danger` | `#fb3748` | `#ff6875` | error-500 / 400 |

Light = `:root`, dark = `.dark` (class toggled before paint by
`@shopwave/hooks` `themeNoFlashScript`).

### Accent palette (badges · tags · charts)

FunRadar accent families, theme-aware like the rest. Use a tint for fills and
the solid token for text: `bg-accent-teal/15 text-accent-teal`.

| Token | Light | Dark | Source |
| --- | --- | --- | --- |
| `accent-teal` | `#1cc9a5` | `#32cfac` | teal-500 / 400 |
| `accent-pink` | `#ea4a9a` | `#f274b7` | hibiscus-500 / 400 |
| `accent-amber` | `#b88116` | `#ecd258` | nugget-600 / 300 |
| `accent-lime` | `#729e12` | `#b3e13a` | atlantis-600 / 400 |

Consumed by:
- `@shopwave/ui` `Badge` tones `teal | pink | amber | lime` (alongside
  `brand/success/warning/danger`).
- `categoryTone(label)` — deterministic label→accent tone for category tags.
- `CHART` series (recharts) — the same hues, fixed across themes.

### Typography

- **Headings / display** → **Geist** (`font-display`), self-hosted via the
  `geist` package → exposes `--font-geist-sans`, mapped to `--font-display`.
- **Body** → **Nunito Sans** (`font-sans`, the default), loaded with
  `next/font/google` as `--font-sans`.

Each app wires both in its root `layout.tsx` and applies the variable classes to
`<html>`. Headings get Geist automatically (base layer rule); use `font-display`
to opt any element into it, `font-sans` for body.

### Extra utilities (human-feel polish)

| Utility | What |
| --- | --- |
| `shadow-soft` | Diffuse low-contrast lift for cards/inputs. |
| `shadow-card` | Slightly stronger hover/elevated state. |
| `rounded-lg/xl/2xl` | Softened corner scale (less boxy). |
| `ring-brand` | Brand-colored focus ring (used by `Button`). |

### Motion

Entrances are CSS keyframes, so they run on server-rendered HTML before any
JavaScript loads, and they animate only `opacity` / `transform` (compositor-only,
smooth even on low-end devices).

| Utility | Use |
| --- | --- |
| `animate-page-in` | Route entrance (each app's `template.tsx`), 250ms |
| `animate-fade-in-up` | List/grid items (`Stagger` adds a per-item delay), 400ms |
| `animate-fade-in` | Lazily-loaded content settling over its skeleton (charts) |
| `animate-fade-in-delayed` | Loading states — invisible for the first 150ms so fast loads never flash |
| `animate-pop-in` | Badges (springy overshoot) |
| `animate-spin-in` | Icon swaps (theme toggle) |
| `ease-out-expo`, `ease-spring` | The shared easing curves for hand-written transitions |

`globals.css` also cross-fades all colours while the theme switches (the
`theme-transition` class, ~250ms), enables smooth in-page scrolling, and honours
the OS **reduce motion** setting by switching every animation and transition off
(spinners excepted).
