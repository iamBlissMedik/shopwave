import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notify } from '@shopwave/hooks';
import { api, type ProductPayload } from '@/api';
import { useInvalidateMerchant } from './useInvalidateMerchant';

export function useUpdateProduct() {
  const invalidate = useInvalidateMerchant();
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ProductPayload> & { isActive?: boolean };
    }) => api.merchant.updateProduct(id, payload),
    onSuccess: (_data, { payload }) => {
      invalidate();
      notify.success('Product updated');
      // A Hide/Show toggle stays on the list; a full edit navigates back to it.
      const isVisibilityToggle = Object.keys(payload).length === 1 && 'isActive' in payload;
      if (!isVisibilityToggle) router.push('/products'); // merchant-app route
    },
    onError: (error) => notify.error(error),
  });
}
