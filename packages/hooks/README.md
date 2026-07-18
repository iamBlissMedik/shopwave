# @shopwave/hooks

The shared **cross-cutting** layer: auth/theme providers, behavioural components, the query-key factory and the toast helper, used by the user, merchant and admin apps. It also owns the single configured transport (`http`) + shared `auth` hook, built on `@shopwave/api-client` + `@shopwave/types`. Keeping these here means every app authenticates, themes and invalidates identically.

**Domain data hooks live in the app that owns them** (the storefront's `useProducts`/`useCart`/`useOrders` in `apps/user/src/hooks`, `useMerchant*` in `apps/merchant`, `useAdmin*` in `apps/admin`), each built on that app's own `src/api`. This package intentionally no longer ships them.

```tsx
// app/providers.tsx
'use client';
import { AppProviders } from '@shopwave/hooks';
export function Providers({ children }) {
  return <AppProviders>{children}</AppProviders>;
}
```

```tsx
// shared, from this package:
import { useAuth, ThemeToggle } from '@shopwave/hooks';
// domain hooks, from the owning app:
import { useProducts, useAddToCart } from '@/hooks';
```

| Group | Exports |
| --- | --- |
| Providers | `AppProviders` (one stack: theme + motion + query + auth + toaster), `AuthProvider`, `ThemeProvider` |
| Auth/theme | `useAuth`, `useTheme`, `themeNoFlashScript`, `ThemeToggle` |
| Access control | `RoleGuard` (UX gate; API is the real boundary) |
| Transport | `http` (shared client), `api.auth`, `getErrorMessage` |
| Keys | `qk` (React Query key factory) |
| Toasts | `notify` |
| Navbar | `DashboardNavbar` |

Domain data hooks (catalogue, cart, orders, merchant, admin) are **not** here — they live in their owning app's `src/hooks`.

Mutation hooks navigate with **app-relative** routes (e.g. merchant `useCreateProduct` pushes `/products`), so each app's route space stays flat per subdomain.

> **Adding a hook?** If the endpoint belongs to one app, add it to that app's `src/api`, add the hook in its `src/hooks`, and register the cache key in this package's `queryKeys.ts` (keys stay shared so invalidation is consistent). Only shared concerns (auth, theme) belong here.
