# @shopwave/hooks

The shared **cross-cutting** layer: auth/theme providers, behavioural components, the query-key factory and the toast helper, used by the user, merchant and admin apps. It also owns the single configured transport (`http`) + shared `auth` hook, built on `@shopwave/api-client` + `@shopwave/types`. Keeping these here means every app authenticates, themes and invalidates identically.

**Domain data hooks live in the app that owns them** (the storefront's `useProducts`/`useCart`/`useOrders` in `apps/user/src/hooks`, `useMerchant*` in `apps/merchant`, `useAdmin*` in `apps/admin`), each built on that app's own `src/api`. This package intentionally no longer ships them.

```tsx
// app/layout.tsx — resolve the session on the server, seed it into the client cache
const queryClient = makeServerQueryClient();
queryClient.setQueryData(qk.me(), await getServerUser());
<body>
  <AppProviders state={dehydrate(queryClient)}>{children}</AppProviders>
</body>
```

```tsx
// shared, from this package:
import { useAuth, ThemeToggle } from '@shopwave/hooks';
// domain hooks, from the owning app:
import { useProducts, useAddToCart } from '@/hooks';
```

| Group | Exports |
| --- | --- |
| Providers | `AppProviders` (theme + React Query + hydration + auth + toaster; takes the root layout's dehydrated `state`), `AuthProvider`, `ThemeProvider` |
| Auth/theme | `useAuth`, `useTheme`, `themeNoFlashScript`, `ThemeToggle` |
| Login | `LoginForm` (shared login page body with optional `role` gate), `safeRedirect` (open-redirect-safe `?redirect=`) |
| URL state | `useUrlFilters` (list filters/pagination in the URL), `toURLSearchParams`, `readPage` / `readString` / `readInt` / `readEnum` |
| Transport | `http` (browser client), `api.auth`, `getErrorMessage` |
| Query cache | `qk` (key factory — each domain has an `all()` root for prefix invalidation), `makeQueryClient` |
| Toasts | `notify` |
| Navbar | `DashboardNavbar` |

**Server-only — `@shopwave/hooks/server`** (Server Components): `getServerHttp()` (calls the API as the visitor: their cookie, their `X-Forwarded-For`; uses `API_URL`), `getServerUser()` (request-cached session, `null` when signed out), `makeServerQueryClient()` (per-request client for prefetching).

**Edge of the app — `@shopwave/hooks/proxy`**: `createAuthProxy()` for each app's `proxy.ts` (cookie-presence redirect that keeps the deep link; the real checks happen on the server and in the API).

Domain data hooks (catalogue, cart, orders, merchant, admin) are **not** here — they live in their owning app's `src/hooks`.

Mutation hooks navigate with **app-relative** routes (e.g. merchant `useCreateProduct` pushes `/products`), so each app's route space stays flat per subdomain.

> **Adding a hook?** If the endpoint belongs to one app, add it to that app's `src/api`, add the hook in its `src/hooks`, and register the cache key in this package's `queryKeys.ts` under its domain (keys stay shared so invalidation is consistent). Invalidate through the factory — `invalidateQueries({ queryKey: qk.merchant.all() })` — never with hand-written arrays. Only shared concerns (auth, theme) belong here.
