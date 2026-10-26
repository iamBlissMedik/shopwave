import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toURLSearchParams } from '@shopwave/hooks';
import { makeServerQueryClient } from '@shopwave/hooks/server';
import { getServerApi } from '@/api/server';
import { categoriesQuery, parseProductFilters, productsQuery } from '@/queries';
import { Catalogue } from '@/components/Catalogue';

/**
 * The catalogue, server-rendered for the filters in the URL (crawlable,
 * shareable), then handed to the client view through the React Query cache.
 */
export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const filters = parseProductFilters(toURLSearchParams(await searchParams));
  const api = await getServerApi();
  const queryClient = makeServerQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(productsQuery(api, filters)),
    queryClient.prefetchQuery(categoriesQuery(api)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Catalogue />
    </HydrationBoundary>
  );
}
