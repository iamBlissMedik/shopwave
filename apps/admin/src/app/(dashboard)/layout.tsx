import { requireServerUser } from '@shopwave/hooks/server';
import { DashboardFrame } from '@/components/DashboardFrame';

/**
 * Every dashboard page renders behind a server-side session check: no client
 * "checking access…" flash, and no dashboard HTML ever reaches a non-admin.
 * (The API still authorizes every request by role.) An expired session goes to
 * `/login` and comes back to the same page; if the API is down, it throws and the
 * error boundary offers a retry rather than a pointless login. Pages' own data
 * fetches wait for the same check (see `api/server.ts`).
 */
export default async function DashboardLayout({ children }: LayoutProps<'/'>) {
  await requireServerUser('ADMIN');

  return <DashboardFrame>{children}</DashboardFrame>;
}
