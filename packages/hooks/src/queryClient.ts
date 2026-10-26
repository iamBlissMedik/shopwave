import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

/**
 * The one place QueryClient defaults are defined, used both by the browser
 * provider and by Server Components that prefetch data for hydration.
 *
 * `staleTime` must be above zero: server-prefetched data is hydrated into the
 * browser cache, and with `staleTime: 0` every query would immediately refetch
 * on mount — doubling the work the server just did. Mutations invalidate the
 * queries they affect explicitly, so a minute of freshness is safe.
 */
export function makeQueryClient(config: QueryClientConfig = {}) {
  return new QueryClient({
    ...config,
    defaultOptions: {
      ...config.defaultOptions,
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        ...config.defaultOptions?.queries,
      },
    },
  });
}
