import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { statsQuery } from '@/queries';
import { OverviewView } from '@/components/OverviewView';

export default async function OverviewPage() {
  const queryClient = makeServerQueryClient();
  await queryClient.prefetchQuery(statsQuery(await getServerApi()));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OverviewView />
    </HydrationBoundary>
  );
}
