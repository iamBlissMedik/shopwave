import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { salesQuery } from '@/queries';

export function useMerchantSales(page: number) {
  return useQuery({ ...salesQuery(api, page), placeholderData: keepPreviousData });
}
