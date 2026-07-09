'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminUserFilters, AdminProductFilters } from '@shopwave/api-client';
import type { Role } from '@shopwave/types';
import { api } from './client';
import { notify } from './notify';
import { qk } from './queryKeys';

export type { AdminUserFilters, AdminProductFilters };

export function useAdminStats() {
  return useQuery({
    queryKey: qk.adminStats(),
    queryFn: () => api.admin.stats(),
  });
}

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: qk.adminUsers(filters),
    queryFn: () => api.admin.users(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: qk.adminProducts(filters),
    queryFn: () => api.admin.products(filters),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useUpdateUserRole() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api.admin.updateUserRole(id, role),
    onSuccess: () => {
      invalidate();
      notify.success('Role updated');
    },
    onError: (error) => notify.error(error),
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => api.admin.deleteUser(id),
    onSuccess: () => {
      invalidate();
      notify.success('User deleted');
    },
    onError: (error) => notify.error(error),
  });
}

/** Admin moderation: toggle a product's visibility. */
export function useModerateProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.admin.moderateProduct(id, isActive),
    onSuccess: () => {
      invalidate();
      notify.success('Product updated');
    },
    onError: (error) => notify.error(error),
  });
}
