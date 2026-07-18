'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notify } from '@shopwave/hooks';
import { api, type ProductPayload } from '@/api';
import { useInvalidateMerchant } from './useInvalidateMerchant';

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
