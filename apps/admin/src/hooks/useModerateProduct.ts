'use client';

import { useMutation } from '@tanstack/react-query';
import { notify } from '@shopwave/hooks';
import { api } from '@/api';
import { useInvalidateAdmin } from './useInvalidateAdmin';

/** Admin moderation: toggle a product's visibility. */
export function useModerateProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.admin.moderateProduct(id, isActive),
    onSuccess: () => {
      invalidate();
      notify.success('Product updated');
    },
    onError: (error) => notify.error(error),
  });
}
