import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { ordersQuery } from '@/queries';

export function useOrders(page: number) {
  return useQuery({ ...ordersQuery(api, page), placeholderData: keepPreviousData });
}
