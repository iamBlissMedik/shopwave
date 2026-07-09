# @shopwave/hooks

The shared **composables** layer: React Query hooks, auth/theme providers, and behavioural components, used by the user, merchant and admin apps. Built on `@shopwave/api-client` + `@shopwave/types`. Keeping these here means every app fetches, caches, and invalidates identically.

```tsx
// app/providers.tsx
'use client';
import { AppProviders } from '@shopwave/hooks';
export function Providers({ children }) {
  return <AppProviders>{children}</AppProviders>;
}
```

```tsx
import { useProducts, useAddToCart, useAuth } from '@shopwave/hooks';
```

| Group | Exports |
| --- | --- |
| Providers | `AppProviders` (one stack: theme + motion + query + auth + toaster), `AuthProvider`, `ThemeProvider` |
| Auth/theme | `useAuth`, `useTheme`, `themeNoFlashScript`, `ThemeToggle` |
| Access control | `RoleGuard` (UX gate; API is the real boundary) |
| Catalogue | `useProducts`, `useProduct`, `useCategories` |
| Cart | `useCart`, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem` |
| Orders | `useOrders`, `useCheckout` |
| Merchant | `useMerchantStats`, `useMerchantProducts`, `useMerchantProduct`, `useMerchantSales`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct` |
| Admin | `useAdminStats`, `useAdminUsers`, `useAdminProducts`, `useUpdateUserRole`, `useDeleteUser`, `useModerateProduct` |
| Keys | `qk` (React Query key factory) |

Mutation hooks navigate with **app-relative** routes (e.g. merchant `useCreateProduct` pushes `/products`), so each app's route space stays flat per subdomain.

> **Adding a hook?** Add the endpoint to `@shopwave/api-client` first, then the hook here, and register its cache key in `queryKeys.ts`.
