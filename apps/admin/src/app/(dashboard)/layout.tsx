import { redirect } from 'next/navigation';
import { getServerUser } from '@shopwave/hooks/server';
import { DashboardFrame } from '@/components/DashboardFrame';

/**
 * Every dashboard page renders behind a server-side session check: no client
 * "checking access…" flash, and no dashboard HTML ever reaches a non-admin.
 * (The API still authorizes every request by role.)
 */
export default async function DashboardLayout({ children }: LayoutProps<'/'>) {
  const user = await getServerUser();
  if (user?.role !== 'ADMIN') redirect('/login');

  return <DashboardFrame>{children}</DashboardFrame>;
}
