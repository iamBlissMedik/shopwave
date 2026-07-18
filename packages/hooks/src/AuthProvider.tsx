'use client';

import { type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { LoginValues, RegisterValues } from '@shopwave/types';
import { api } from './client';
import { qk } from './queryKeys';
import { AuthContext, type AuthContextValue } from './authContext';

/**
 * Auth state lives entirely on the server (httpOnly cookie). The client learns
 * "who am I" by calling GET /auth/me. We cache that result with React Query and
 * invalidate it after login/logout so the whole UI updates at once.
 *
 * Shared across all three apps; the API enforces role on every request, so the
 * same provider works whether it's mounted in the user, merchant or admin app.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: qk.me(),
    queryFn: async () => {
      try {
        const { user } = await api.auth.me();
        return user;
      } catch {
        return null; // not logged in
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => api.auth.login(values),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) => api.auth.register(values),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    login: async (values) => (await loginMutation.mutateAsync(values)).user,
    register: async (values) => (await registerMutation.mutateAsync(values)).user,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
