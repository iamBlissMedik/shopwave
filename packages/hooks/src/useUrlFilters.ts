'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

type FilterValue = string | number | undefined;

/**
 * List filters / pagination stored in the URL, so a filtered page can be shared,
 * bookmarked, server-rendered and restored with the Back button.
 *
 * `parse` is the same pure function the page's Server Component uses to
 * prefetch — so the first render hits the hydrated cache. Updates go through
 * `history.pushState` / `replaceState`, which Next syncs with `useSearchParams`
 * without a server round-trip; React Query then fetches the new list.
 *
 *  - Changing anything but `page` resets to page 1 and replaces the history
 *    entry (typing in a search box doesn't flood Back).
 *  - Changing `page` pushes a history entry and scrolls smoothly to the top.
 *  - Values equal to the parser's defaults are left out of the URL.
 *
 * `parse` must be stable (define it at module scope).
 */
export function useUrlFilters<T extends { [K in keyof T]: FilterValue }>(
  parse: (params: URLSearchParams) => T,
) {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parse(new URLSearchParams(searchParams.toString())),
    [parse, searchParams],
  );
  const defaults = useMemo(() => parse(new URLSearchParams()), [parse]);

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const isPageChange = 'page' in patch;
      const next: Record<string, FilterValue> = { ...filters, ...patch };
      if (!isPageChange && 'page' in next) next.page = 1;

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '' || value === defaults[key as keyof T]) continue;
        params.set(key, String(value));
      }
      const query = params.toString();
      const url = query ? `?${query}` : window.location.pathname;

      if (isPageChange) {
        window.history.pushState(null, '', url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.history.replaceState(null, '', url);
      }
    },
    [filters, defaults],
  );

  return [filters, setFilters] as const;
}
