'use client';

import { useState, type ReactNode } from 'react';
import {
  HydrationBoundary,
  QueryCache,
  QueryClientProvider,
  type DehydratedState,
} from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { makeQueryClient } from './queryClient';
import { notify } from './notify';

/**
 * One provider stack shared by the user, merchant and admin apps:
 *  - ThemeProvider     — light/dark/system, no-flash
 *  - React Query       — server-state cache (one client per browser session)
 *  - HydrationBoundary — seeds the cache with what the root layout fetched on
 *                        the server (the signed-in user), so the first HTML
 *                        already shows the right navbar — no auth flicker
 *  - AuthProvider      — current-user context backed by the httpOnly cookie
 *  - Toaster           — notifications
 */
export function AppProviders({
  state,
  children,
}: {
  /** `dehydrate(queryClient)` from the root layout. */
  state?: DehydratedState;
  children: ReactNode;
}) {
  const [queryClient] = useState(() =>
    makeQueryClient({
      // Surface read failures globally so a broken GET shows a toast instead of
      // failing silently. Mutations toast via their own hooks (with success
      // messages and cache writes), so they opt out here.
      queryCache: new QueryCache({
        onError: (error, query) => {
          if (query.meta?.silent) return;
          notify.error(error);
        },
      }),
    }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={state}>
          <AuthProvider>{children}</AuthProvider>
        </HydrationBoundary>
        <Toaster
          position="top-center"
          toastOptions={{ className: '!bg-surface !text-foreground !border !border-border' }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
