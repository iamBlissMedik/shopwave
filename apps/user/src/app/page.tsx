'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProducts, type ProductFilters } from '@/hooks';
import { staggerContainer, Pagination, LoadingState } from '@shopwave/ui';
import { ProductCard } from '@/components/ProductCard';
import { Filters } from '@/components/Filters';

export default function HomePage() {
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 12, sort: 'newest' });
  const { data, isLoading, isError } = useProducts(filters);

  // Any filter change (except page) resets back to page 1.
  const patchFilters = (patch: Partial<ProductFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 'page' in patch ? patch.page! : 1 }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Browse the marketplace</h1>
        <p className="text-sm text-muted">Products from every store — search, filter and sort.</p>
      </div>

      <Filters filters={filters} onChange={patchFilters} />

      {isLoading && <LoadingState message="Loading products…" />}
      {isError && <p className="py-12 text-center text-danger">Failed to load products.</p>}

      {data && data.data.length === 0 && (
        <p className="py-12 text-center text-muted">No products match your filters.</p>
      )}

      {data && data.data.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted">{data.meta.total} product(s) found</p>
          {/* `key` changes whenever the filters/page change, so the grid
              re-mounts and the stagger entrance replays on each new result set. */}
          <motion.div
            key={JSON.stringify(filters)}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
          <Pagination meta={data.meta} onPageChange={(page) => patchFilters({ page })} />
        </>
      )}
    </div>
  );
}
