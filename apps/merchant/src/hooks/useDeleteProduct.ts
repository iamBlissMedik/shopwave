'use client';

import { useMutation } from '@tanstack/react-query';
import { notify } from '@shopwave/hooks';
import { api } from '@/api';
import { useInvalidateMerchant } from './useInvalidateMerchant';

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
