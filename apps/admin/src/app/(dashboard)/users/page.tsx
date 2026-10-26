import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toURLSearchParams } from '@shopwave/hooks';
import { makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { parseUserFilters, usersQuery } from '@/queries';
import { UsersView } from '@/components/UsersView';

export const metadata: Metadata = { title: 'Users' };

export default async function UsersPage({ searchParams }: PageProps<'/users'>) {
  const filters = parseUserFilters(toURLSearchParams(await searchParams));
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(usersQuery(await getServerApi(), filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersView />
    </HydrationBoundary>
  );
}
