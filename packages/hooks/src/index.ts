// Public surface of @shopwave/hooks — cross-cutting providers, auth/theme state,
// behavioural components and utilities shared by the user, merchant and admin
// apps. Domain data hooks (products, cart, orders, merchant, admin) live in the
// app that owns them, under that app's `src/hooks`.

export { api, http, getErrorMessage } from './client';
export { notify } from './notify';
export { qk } from './queryKeys';

// Providers & behavioural components
export { AppProviders } from './AppProviders';
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export { ThemeProvider } from './ThemeProvider';
export { useTheme } from './useTheme';
export { themeNoFlashScript } from './themeNoFlashScript';
export type { Theme } from './themeContext';
export { ThemeToggle } from './ThemeToggle';
export { RoleGuard } from './RoleGuard';
export { DashboardNavbar } from './DashboardNavbar';
