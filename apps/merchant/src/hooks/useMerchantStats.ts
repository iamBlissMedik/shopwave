import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { statsQuery } from '@/queries';

export function useMerchantStats() {
  return useQuery(statsQuery(api));
}
