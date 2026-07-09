// Public surface of @shopwave/hooks — shared composables, providers and
// behavioural components for the user, merchant and admin apps.

export { api, http, getErrorMessage } from './client';
export { notify } from './notify';
export { qk } from './queryKeys';

// Providers & behavioural components
export { AppProviders } from './AppProviders';
export { AuthProvider, useAuth } from './useAuth';
export { ThemeProvider, useTheme, themeNoFlashScript, type Theme } from './useTheme';
export { ThemeToggle } from './ThemeToggle';
export { RoleGuard } from './RoleGuard';
export { DashboardNavbar } from './DashboardNavbar';

// Data hooks
export { useProducts, useProduct, useCategories, type ProductFilters } from './useProducts';
export { useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem } from './useCart';
export { useOrders, useCheckout } from './useOrders';
export {
  useMerchantStats,
  useMerchantProducts,
  useMerchantProduct,
  useMerchantSales,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type MerchantProductFilters,
  type ProductPayload,
} from './useMerchant';
export {
  useAdminStats,
  useAdminUsers,
  useAdminProducts,
  useUpdateUserRole,
  useDeleteUser,
  useModerateProduct,
  type AdminUserFilters,
  type AdminProductFilters,
} from './useAdmin';
