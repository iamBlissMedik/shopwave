'use client';

import type { ReactNode } from 'react';
import { SearchInput } from './SearchInput';

export interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

/**
 * Reusable filter bar: a debounced search box on the left and any number of
 * extra controls (selects, ranges) passed as children. Used by the catalogue,
 * merchant products, admin users and admin products tables.
 */
export function FilterBar({ search, onSearch, searchPlaceholder, children }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center">
      <div className="sm:max-w-xs sm:flex-1">
        <SearchInput value={search} onSearch={onSearch} placeholder={searchPlaceholder} />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
