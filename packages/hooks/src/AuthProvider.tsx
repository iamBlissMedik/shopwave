'use client';

import { useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HttpError } from '@shopwave/api-client';
import type { LoginValues, RegisterValues } from '@shopwave/types';
import { api } from './client';
import { qk } from './queryKeys';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';

/**
 * Auth state lives entirely on the server (httpOnly cookie). The client learns
 * "who am I" from GET /auth/me — usually already in the cache, because the root
 * layout fetched it during SSR and hydrated it. Login invalidates every query so
 * the whole UI updates at once.
 *
 * An unreachable API leaves the session `unknown` rather than "signed out", and
 * the check keeps retrying (every 30s and on tab focus) until it gets an answer.
 *
 * Shared across all three apps; the API enforces role on every request, so the
 * same provider works whether it's mounted in the user, merchant or admin app.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, status: queryStatus } = useQuery({
    queryKey: qk.me(),
    queryFn: async () => {
      try {
        const { user } = await api.auth.me();
        return user;
      } catch (error) {
        // 401 = no / expired session, 404 = deleted account: a definite "signed out".
        if (error instanceof HttpError && (error.status === 401 || error.status === 404)) return null;
        // Anything else (offline, 5xx) is unknown: fail the query so it is retried
        // rather than caching "signed out" for the next five minutes.
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => (query.state.status === 'error' ? 30_000 : false),
    refetchOnWindowFocus: (query) => query.state.status === 'error',
    // The page's own queries already toast when the API is unreachable.
    meta: { silent: true },
  });

  // `data` survives a failed refetch, so a known answer is kept until replaced.
  const status: AuthStatus =
    user ? 'signed-in' : user === null ? 'signed-out' : queryStatus === 'error' ? 'unknown' : 'loading';

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
      status,
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
    [user, status, loginAsync, registerAsync, logoutAsync],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
