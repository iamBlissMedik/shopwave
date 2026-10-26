# @shopwave/hooks

The shared **cross-cutting** layer: auth/theme providers, behavioural components, the query-key factory and the toast helper, used by the user, merchant and admin apps. It also owns the single configured transport (`http`) + shared `auth` hook, built on `@shopwave/api-client` + `@shopwave/types`. Keeping these here means every app authenticates, themes and invalidates identically.

**Domain data hooks live in the app that owns them** (the storefront's `useProducts`/`useCart`/`useOrders` in `apps/user/src/hooks`, `useMerchant*` in `apps/merchant`, `useAdmin*` in `apps/admin`), each built on that app's own `src/api`. This package intentionally no longer ships them.

```tsx
// app/layout.tsx — each app's root layout is just metadata + the shared shell, which
// owns fonts, the theme script, providers and the server-resolved session.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <AppShell navbar={<Navbar />}>{children}</AppShell>;
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
| Providers | `AppProviders` (theme + React Query + hydration + auth + toaster; takes the root layout's dehydrated `state`), `AuthProvider`, `ThemeProvider` |
| Auth/theme | `useAuth` (`user`, `status`: `loading` / `signed-in` / `signed-out` / `unknown` when the API is unreachable, plus `login` / `register` / `logout`), `useTheme`, `themeNoFlashScript`, `ThemeToggle` |
| Login | `LoginForm` (shared login page body with optional `role` gate), `safeRedirect` (open-redirect-safe `?redirect=`) |
| URL state | `useUrlFilters` (list filters/pagination in the URL), `toURLSearchParams`, `readPage` / `readString` / `readInt` / `readEnum` |
| Transport | `http` (browser client), `api.auth`, `getErrorMessage` |
| Query cache | `qk` (key factory — each domain has an `all()` root for prefix invalidation), `makeQueryClient` |
| Toasts | `notify` |
| Navbar | `DashboardNavbar` |

**Server-only — `@shopwave/hooks/server`** (Server Components):

| Export | Purpose |
| --- | --- |
| `getServerHttp()` | Calls the API as the visitor: their cookie, and their IP resolved from the trusted end of `X-Forwarded-For` (`TRUSTED_PROXY_HOPS`, default 1). Uses `API_URL`. |
| `createServerApi(createApi, { role? })` | Binds an app's endpoint factory to that transport: `export const getServerApi = createServerApi(createApi)`. Dashboards pass `role`, so every page's data fetch waits for `requireServerUser(role)` instead of racing its layout's guard. |
| `getServerSession()` | Request-cached session: `signed-in` (with `user`), `signed-out`, or `unavailable` when the API couldn't say. Never throws for API problems. |
| `getServerUser()` | For guards: the user, or `null` when definitely signed out. Throws `SessionUnavailableError` when the API is down, so the error boundary offers a retry instead of a pointless login. |
| `requireServerUser(role)` | Guard for role-restricted areas: the user, or `redirectToLogin()`; throws `SessionUnavailableError` when the API is down. |
| `redirectToLogin()` | Sends the visitor to `/login?redirect=<current page>`, using the path the proxy recorded. |
| `makeServerQueryClient()` | Per-request client for prefetching. |

**Root layouts — `@shopwave/hooks/shell`**: `AppShell` renders the shared `<html>` document. It only seeds the session into the client cache when the API gave a definite answer, so an outage is never cached as "signed out".

**Edge of the app — `@shopwave/hooks/proxy`**: `createAuthProxy()` for each app's `proxy.ts` (cookie-presence redirect that keeps the deep link; the real checks happen on the server and in the API). Requests it lets through carry the visited path in `PATHNAME_HEADER` for `redirectToLogin`.

Domain data hooks (catalogue, cart, orders, merchant, admin) are **not** here — they live in their owning app's `src/hooks`.

Mutation hooks navigate with **app-relative** routes (e.g. merchant `useCreateProduct` pushes `/products`), so each app's route space stays flat per subdomain.

> **Adding a hook?** If the endpoint belongs to one app, add it to that app's `src/api`, add the hook in its `src/hooks`, and register the cache key in this package's `queryKeys.ts` under its domain (keys stay shared so invalidation is consistent). Invalidate through the factory — `invalidateQueries({ queryKey: qk.merchant.all() })` — never with hand-written arrays. Only shared concerns (auth, theme) belong here.
