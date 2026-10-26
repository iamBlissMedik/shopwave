'use client';

import { clsx } from 'clsx';
import { useCategories, type ProductFilters } from '@/hooks';
import { FilterBar, Select, fieldClasses } from '@shopwave/ui';

interface Props {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
}

const priceInputClass = clsx(fieldClasses, 'w-24 border-border');

/** Dollars typed by the user → integer cents for the API (empty = no bound). */
const toCents = (value: string) => (value ? Math.round(Number(value) * 100) : undefined);

/**
 * Catalogue filters built on the shared FilterBar: debounced search + category,
 * sort and a price range. Each change updates the URL (via `useUrlFilters`),
 * which resets to page 1 and refetches (filters are part of the React Query
 * key). Price bounds apply on blur / Enter so typing "120" doesn't fire three
 * requests.
 */
export function Filters({ filters, onChange }: Props) {
  const { data: categories } = useCategories();

  // Only push a bound that actually changed — a bare blur must not reset the page.
  const setPrice = (key: 'minPrice' | 'maxPrice', value: string) => {
    const cents = toCents(value);
    if (cents !== filters[key]) onChange({ [key]: cents });
  };

  return (
    <FilterBar
      search={filters.search ?? ''}
      onSearch={(search) => onChange({ search: search || undefined })}
      searchPlaceholder="Search products…"
    >
      <Select
        aria-label="Category"
        value={filters.category ?? ''}
        onChange={(e) => onChange({ category: e.target.value || undefined })}
      >
        <option value="">All categories</option>
        {categories?.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Sort by"
        value={filters.sort ?? 'newest'}
        onChange={(e) => onChange({ sort: e.target.value as ProductFilters['sort'] })}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A–Z</option>
      </Select>

      <div className="flex items-center gap-1">
        <input
          // Re-keyed on the URL value so Back/Forward refreshes the uncontrolled input.
          key={`min-${filters.minPrice ?? ''}`}
          type="number"
          min={0}
          inputMode="decimal"
          aria-label="Minimum price in dollars"
          placeholder="Min $"
          defaultValue={filters.minPrice !== undefined ? filters.minPrice / 100 : ''}
          onBlur={(e) => setPrice('minPrice', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className={priceInputClass}
        />
        <span className="text-muted" aria-hidden>
          –
        </span>
        <input
          key={`max-${filters.maxPrice ?? ''}`}
          type="number"
          min={0}
          inputMode="decimal"
          aria-label="Maximum price in dollars"
          placeholder="Max $"
          defaultValue={filters.maxPrice !== undefined ? filters.maxPrice / 100 : ''}
          onBlur={(e) => setPrice('maxPrice', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className={priceInputClass}
        />
      </div>
    </FilterBar>
  );
}
