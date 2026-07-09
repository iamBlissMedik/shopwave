'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * Debounced search box. Calls `onSearch` ~400ms after the user stops typing,
 * so list endpoints aren't hit on every keystroke. Reused by every filter bar.
 */
export function SearchInput({
  value,
  onSearch,
  placeholder = 'Search…',
}: {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);

  // Keep the input in sync if the parent resets the filter externally.
  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (local !== value) onSearch(local);
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-3 top-2.5 text-muted" />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}
