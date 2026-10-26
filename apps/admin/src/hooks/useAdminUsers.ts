import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, type AdminUserFilters } from '@/api';
import { usersQuery } from '@/queries';

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({ ...usersQuery(api, filters), placeholderData: keepPreviousData });
}
