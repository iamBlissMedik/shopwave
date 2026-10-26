import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { categoriesQuery } from '@/queries';

export function useCategories() {
  return useQuery(categoriesQuery(api));
}
