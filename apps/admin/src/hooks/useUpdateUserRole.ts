import { useMutation } from '@tanstack/react-query';
import type { Role } from '@shopwave/types';
import { notify } from '@shopwave/hooks';
import { api } from '@/api';
import { useInvalidateAdmin } from './useInvalidateAdmin';

export function useUpdateUserRole() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api.admin.updateUserRole(id, role),
    onSuccess: () => {
      invalidate();
      notify.success('Role updated');
    },
    onError: (error) => notify.error(error),
  });
}
