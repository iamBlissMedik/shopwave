'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { fieldClasses } from './Input';

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
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-2.5 text-muted"
        aria-hidden
      />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={clsx(fieldClasses, 'w-full border-border pl-9')}
      />
    </div>
  );
}
