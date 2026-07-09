import type { AdminStats, AdminUser, Paginated, Product, Role } from '@shopwave/types';
import type { Http } from '../client';

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

export interface AdminProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}

/** ADMIN-only console endpoints. */
export function adminEndpoints(http: Http) {
  return {
    stats: () => http.get<AdminStats>('/admin/stats'),
    users: (filters: AdminUserFilters) => http.get<Paginated<AdminUser>>('/admin/users', filters),
    products: (filters: AdminProductFilters) =>
      http.get<Paginated<Product>>('/admin/products', filters),
    updateUserRole: (id: string, role: Role) =>
      http.patch<{ user: AdminUser }>(`/admin/users/${id}/role`, { role }),
    deleteUser: (id: string) => http.delete<{ message: string }>(`/admin/users/${id}`),
    moderateProduct: (id: string, isActive: boolean) =>
      http.patch<{ product: Product }>(`/admin/products/${id}`, { isActive }),
  };
}
