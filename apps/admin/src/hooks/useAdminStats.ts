import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { statsQuery } from '@/queries';

export function useAdminStats() {
  return useQuery(statsQuery(api));
}
