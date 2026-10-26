// Public surface of @shopwave/hooks — cross-cutting providers, auth/theme state,
// behavioural components and utilities shared by the user, merchant and admin
// apps. Domain data hooks (products, cart, orders, merchant, admin) live in the
// app that owns them, under that app's `src/hooks`.
//
// Server Components import server-only helpers from `@shopwave/hooks/server`,
// root layouts render `AppShell` from `@shopwave/hooks/shell`, and `proxy.ts`
// files import `@shopwave/hooks/proxy`.

export { api, http, getErrorMessage } from './client';
export { notify } from './notify';
export { qk } from './queryKeys';
export { makeQueryClient } from './queryClient';
export { useUrlFilters } from './useUrlFilters';
export { toURLSearchParams, readEnum, readInt, readPage, readString } from './searchParams';

// Providers & behavioural components
export { AppProviders } from './AppProviders';
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export type { AuthStatus } from './authContext';
export { ThemeProvider } from './ThemeProvider';
export { useTheme } from './useTheme';
export { themeNoFlashScript } from './themeNoFlashScript';
export type { Theme } from './themeContext';
export { ThemeToggle } from './ThemeToggle';
export { LoginForm, type LoginFormProps } from './LoginForm';
export { safeRedirect } from './safeRedirect';
export { DashboardNavbar } from './DashboardNavbar';
