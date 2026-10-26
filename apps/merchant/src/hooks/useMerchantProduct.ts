import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { productQuery } from '@/queries';

/** A single owned product, for the edit form. */
export function useMerchantProduct(id: string) {
  return useQuery(productQuery(api, id));
}
