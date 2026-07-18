'use client';

import { useCategories, type ProductFilters } from '@/hooks';
import { FilterBar } from '@shopwave/ui';

interface Props {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
}

const selectClass =
  'rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/40';

/**
 * Catalogue filters built on the shared FilterBar: debounced search + category,
 * sort and a price range. Each change is pushed up to the page, which resets to
 * page 1 and refetches (filters are part of the React Query key).
 */
export function Filters({ filters, onChange }: Props) {
  const { data: categories } = useCategories();

  return (
    <FilterBar
      search={filters.search ?? ''}
      onSearch={(search) => onChange({ search: search || undefined })}
      searchPlaceholder="Search products…"
    >
      <select
        value={filters.category ?? ''}
        onChange={(e) => onChange({ category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All categories</option>
        {categories?.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.sort ?? 'newest'}
        onChange={(e) => onChange({ sort: e.target.value as ProductFilters['sort'] })}
        className={selectClass}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A–Z</option>
      </select>

      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          placeholder="Min $"
          defaultValue={filters.minPrice ? filters.minPrice / 100 : ''}
          onBlur={(e) =>
            onChange({ minPrice: e.target.value ? Math.round(Number(e.target.value) * 100) : undefined })
          }
          className={`w-20 ${selectClass}`}
        />
        <span className="text-muted">–</span>
        <input
          type="number"
          min={0}
          placeholder="Max $"
          defaultValue={filters.maxPrice ? filters.maxPrice / 100 : ''}
          onBlur={(e) =>
            onChange({ maxPrice: e.target.value ? Math.round(Number(e.target.value) * 100) : undefined })
          }
          className={`w-20 ${selectClass}`}
        />
      </div>
    </FilterBar>
  );
}
