'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@shopwave/types';
import { useAuth } from './useAuth';

/**
 * Client-side role gate for the merchant/admin apps.
 *
 * This is a UX guard (shows a spinner, then redirects to that app's login). The
 * REAL security boundary is the API, which authorizes every request by role —
 * so even if a user reached the page, no protected data would load. Defense in
 * depth. Because each app owns its subdomain, both "not logged in" and "wrong
 * role" send the visitor to `/login` to authenticate as the right role.
 */
export function RoleGuard({
  allow,
  children,
  redirectTo = '/login',
}: {
  allow: Role[];
  children: ReactNode;
  redirectTo?: string;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const allowed = Boolean(user && allow.includes(user.role));

  useEffect(() => {
    if (isLoading) return;
    if (!allowed) router.replace(redirectTo);
  }, [allowed, isLoading, redirectTo, router]);

  if (isLoading || !allowed) {
    return <p className="py-20 text-center text-sm text-muted">Checking access…</p>;
  }

  return <>{children}</>;
}
