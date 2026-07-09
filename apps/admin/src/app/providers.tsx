'use client';

import type { ReactNode } from 'react';
import { AppProviders } from '@shopwave/hooks';

/** Theme + motion + React Query + Auth + Toaster, all from the shared stack. */
export function Providers({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
