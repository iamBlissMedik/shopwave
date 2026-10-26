'use client';

import { clsx } from 'clsx';
import { SearchX } from 'lucide-react';
import { useUrlFilters } from '@shopwave/hooks';
import { Button, EmptyState, ErrorState, LoadingState, Pagination, Stagger } from '@shopwave/ui';
import { useProducts } from '@/hooks';
import { parseProductFilters } from '@/queries';
import { ProductCard } from './ProductCard';
import { Filters } from './Filters';

/** Interactive catalogue: URL-driven filters, the product grid and pagination. */
export function Catalogue() {
  const [filters, setFilters] = useUrlFilters(parseProductFilters);
  const { data, isLoading, isError, isPlaceholderData, refetch } = useProducts(filters);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Browse the marketplace</h1>
        <p className="text-sm text-muted">Products from every store — search, filter and sort.</p>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      {isLoading && <LoadingState message="Loading products…" />}

      {isError && !data && (
        <ErrorState message="We couldn’t load the catalogue.">
          <Button onClick={() => refetch()}>Try again</Button>
        </ErrorState>
      )}

      {data && data.data.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No products match your filters"
          message="Try a different search, category or price range."
        />
      )}

      {data && data.data.length > 0 && (
        <div
          aria-busy={isPlaceholderData || undefined}
          className={clsx('transition-opacity duration-200', isPlaceholderData && 'opacity-60')}
        >
          <p className="mb-4 text-sm text-muted">{data.meta.total} product(s) found</p>
          {/* Keyed on the products shown, so the cascade replays when the results
              actually change — not while the previous page is still on screen. */}
          <Stagger
            key={data.data.map((p) => p.id).join()}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {data.data.map((product, i) => (
              // The first row (4 on desktop) is above the fold — load it eagerly.
              <ProductCard key={product.id} product={product} eager={i < 4} />
            ))}
          </Stagger>
          <Pagination meta={data.meta} onPageChange={(page) => setFilters({ page })} />
        </div>
      )}
    </div>
  );
}
