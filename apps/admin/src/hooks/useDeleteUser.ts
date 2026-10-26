import { useMutation } from '@tanstack/react-query';
import { notify } from '@shopwave/hooks';
import { api } from '@/api';
import { useInvalidateAdmin } from './useInvalidateAdmin';

export function useDeleteUser() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: string) => api.admin.deleteUser(id),
    onSuccess: () => {
      invalidate();
      notify.success('User deleted');
    },
    onError: (error) => notify.error(error),
  });
}
