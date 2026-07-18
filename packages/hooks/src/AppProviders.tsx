'use client';

import { useState, type ReactNode } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { notify } from './notify';

/**
 * One provider stack shared by the user, merchant and admin apps:
 *  - ThemeProvider     — light/dark/system, no-flash
 *  - MotionConfig      — honors prefers-reduced-motion globally
 *  - React Query       — server-state cache (one client per browser session)
 *  - AuthProvider      — current-user context backed by the httpOnly cookie
 *  - Toaster           — notifications
 *
 * Each app's `providers.tsx` becomes a one-liner: `<AppProviders>{children}</AppProviders>`.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Surface read failures globally so a broken GET shows a toast instead
        // of failing silently. Mutations toast via their own hooks (with success
        // messages and cache writes), so they opt out here.
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.silent) return;
            notify.error(error);
          },
        }),
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              className: '!bg-surface !text-foreground !border !border-border',
            }}
          />
        </QueryClientProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
