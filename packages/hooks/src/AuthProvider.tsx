'use client';

import { useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginValues, RegisterValues } from '@shopwave/types';
import { api } from './client';
import { qk } from './queryKeys';
import { AuthContext, type AuthContextValue } from './authContext';

/**
 * Auth state lives entirely on the server (httpOnly cookie). The client learns
 * "who am I" from GET /auth/me — usually already in the cache, because the root
 * layout fetched it during SSR and hydrated it. Login invalidates every query so
 * the whole UI updates at once.
 *
 * Shared across all three apps; the API enforces role on every request, so the
 * same provider works whether it's mounted in the user, merchant or admin app.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

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

  const { mutateAsync: loginAsync } = useMutation({
    mutationFn: (values: LoginValues) => api.auth.login(values),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const { mutateAsync: registerAsync } = useMutation({
    mutationFn: (values: RegisterValues) => api.auth.register(values),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const { mutateAsync: logoutAsync } = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.clear();
      // Known signed-out state, so the session query doesn't refetch (and 401).
      queryClient.setQueryData(qk.me(), null);
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading,
      login: async (values) => (await loginAsync(values)).user,
      register: async (values) => (await registerAsync(values)).user,
      logout: async ({ redirect = true } = {}) => {
        await logoutAsync();
        // A full navigation, not a client transition: every server-rendered page
        // and the dashboard guards re-run without the cookie, and no signed-in
        // state can linger in memory.
        if (redirect) window.location.assign('/');
      },
    }),
    [user, isLoading, loginAsync, registerAsync, logoutAsync],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
