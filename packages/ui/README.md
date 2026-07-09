# @shopwave/ui

The shared, **presentational** component library consumed by every role area
(customer storefront, merchant dashboard, admin console) in the web app.

These components are intentionally "dumb": they take props and render UI. They
contain **no data fetching, no business logic, and no app-specific types** — that
keeps them reusable and trivial to test and document.

```ts
import { Button, DataTable, FilterBar, RevenueChart } from '@shopwave/ui';
```

It ships as raw TS/TSX and is transpiled by Next.js (`transpilePackages`), so
there is no build step during development.

## What's inside

| Component | Purpose |
| --- | --- |
| `Button`, `Input`, `Card`, `Badge` | Themeable primitives |
| `SearchInput` | Debounced search box |
| `FilterBar` | Search + slot for extra filter controls |
| `Pagination` | Prev / page / Next control |
| `DataTable` | Generic table → real `<table>` on desktop, cards on mobile |
| `StatCard` | Dashboard metric tile |
| `RevenueChart`, `BarStat` | Recharts wrappers (app-agnostic) |

All components style themselves with the app's **semantic Tailwind tokens**
(`bg-surface`, `text-foreground`, `text-muted`, `border-border`, `text-brand`…),
so they automatically adapt to light/dark themes.

## Scripts

```bash
pnpm --filter @shopwave/ui test         # run component tests (Vitest + Testing Library)
pnpm --filter @shopwave/ui test:watch   # watch mode
pnpm --filter @shopwave/ui storybook    # run Storybook on :6006
pnpm --filter @shopwave/ui typecheck    # tsc --noEmit
```

---

## 📐 The rule: every component must be documented & tested

> **A component is not "done" until it has all three of the following.**
> This is enforced in code review — PRs adding a component without them are sent back.

For every new component `Foo` in `src/`:

1. **JSDoc** — a `/** … */` block above the component explaining what it is and
   when to use it. Document non-obvious props.
2. **A story** — `Foo.stories.tsx` with at least a default story and one story per
   important variant/state (loading, empty, error…). Stories are living docs +
   manual QA.
3. **A test** — `__tests__/Foo.test.tsx` covering its core behaviour (renders,
   key interactions, important conditional states).

Also: export the component **and its prop types** from `src/index.ts`, and use
the semantic tokens (never raw `gray-800` etc.) so theming keeps working.

### New-component checklist

- [ ] JSDoc on the component (and tricky props)
- [ ] `Foo.stories.tsx` — default + variants/states
- [ ] `__tests__/Foo.test.tsx` — behaviour covered
- [ ] Exported (component + types) from `src/index.ts`
- [ ] Uses semantic tokens only (theme-safe)
- [ ] `'use client'` only if it uses state/effects/events

Keeping this discipline is what makes the library safe to grow: anyone can find,
preview, and trust a component without reading its source.
