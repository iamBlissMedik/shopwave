'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { MerchantProductFilters, ProductPayload } from '@shopwave/api-client';
import { api } from './client';
import { notify } from './notify';
import { qk } from './queryKeys';

export type { MerchantProductFilters, ProductPayload };

export function useMerchantStats() {
  return useQuery({
    queryKey: qk.merchantStats(),
    queryFn: () => api.merchant.stats(),
  });
}

export function useMerchantProducts(filters: MerchantProductFilters) {
  return useQuery({
    queryKey: qk.merchantProducts(filters),
    queryFn: () => api.merchant.products(filters),
    placeholderData: keepPreviousData,
  });
}

/** A single owned product, for the edit form. */
export function useMerchantProduct(id: string) {
  return useQuery({
    queryKey: qk.merchantProduct(id),
    queryFn: () => api.merchant.product(id),
    enabled: Boolean(id),
  });
}

export function useMerchantSales(page = 1) {
  return useQuery({
    queryKey: qk.merchantSales(page),
    queryFn: () => api.merchant.sales(page),
    placeholderData: keepPreviousData,
  });
}

/** Invalidate everything affected by a product change. */
function useInvalidateMerchant() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['merchant'] });
    queryClient.invalidateQueries({ queryKey: ['products'] }); // public catalogue
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidateMerchant();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ProductPayload) => api.merchant.createProduct(payload),
    onSuccess: () => {
      invalidate();
      notify.success('Product created');
      router.push('/products'); // merchant-app route
    },
    onError: (error) => notify.error(error),
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateMerchant();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> & { isActive?: boolean } }) =>
      api.merchant.updateProduct(id, payload),
    onSuccess: (_data, vars) => {
      invalidate();
      notify.success('Product updated');
      // A simple toggle (isActive only) stays on the list; a full edit returns to it too.
      if (!('isActive' in vars.payload) || Object.keys(vars.payload).length > 1) {
        router.push('/products'); // merchant-app route
      }
    },
    onError: (error) => notify.error(error),
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateMerchant();
  return useMutation({
    mutationFn: (id: string) => api.merchant.deleteProduct(id),
    onSuccess: () => {
      invalidate();
      notify.success('Product removed');
    },
    onError: (error) => notify.error(error),
  });
}
