// Admin console data hooks — one hook per file, built on this app's `src/api`.
export { useAdminStats } from './useAdminStats';
export { useAdminUsers } from './useAdminUsers';
export { useAdminProducts } from './useAdminProducts';
export { useUpdateUserRole } from './useUpdateUserRole';
export { useDeleteUser } from './useDeleteUser';
export { useModerateProduct } from './useModerateProduct';
export type { AdminUserFilters, AdminProductFilters } from '@/api';
