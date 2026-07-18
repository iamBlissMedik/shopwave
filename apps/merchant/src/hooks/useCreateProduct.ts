'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notify } from '@shopwave/hooks';
import { api, type ProductPayload } from '@/api';
import { useInvalidateMerchant } from './useInvalidateMerchant';

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
