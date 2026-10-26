import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { readPage, readString } from '../searchParams';

// Simulate Next's `useSearchParams`, which tracks the URL that pushState /
// replaceState write.
let currentSearch = '';
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

import { useUrlFilters } from '../useUrlFilters';

const parse = (p: URLSearchParams) => ({
  page: readPage(p),
  limit: 10,
  search: readString(p, 'search'),
});

describe('useUrlFilters', () => {
  const pushState = vi.spyOn(window.history, 'pushState');
  const replaceState = vi.spyOn(window.history, 'replaceState');
  const scrollTo = vi.fn();

  beforeEach(() => {
    currentSearch = '';
    window.scrollTo = scrollTo;
  });
  afterEach(() => vi.clearAllMocks());

  it('parses the current URL', () => {
    currentSearch = 'page=3&search=mouse';
    const { result } = renderHook(() => useUrlFilters(parse));
    expect(result.current[0]).toEqual({ page: 3, limit: 10, search: 'mouse' });
  });

  it('replaces history for filter changes, resets the page and omits defaults', () => {
    currentSearch = 'page=3';
    const { result } = renderHook(() => useUrlFilters(parse));
    act(() => result.current[1]({ search: 'desk' }));
    expect(replaceState).toHaveBeenCalledWith(null, '', '?search=desk');
    expect(pushState).not.toHaveBeenCalled();
  });

  it('pushes history and scrolls to the top for page changes', () => {
    currentSearch = 'search=desk';
    const { result } = renderHook(() => useUrlFilters(parse));
    act(() => result.current[1]({ page: 2 }));
    expect(pushState).toHaveBeenCalledWith(null, '', '?page=2&search=desk');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('falls back to the bare path when every value is a default', () => {
    currentSearch = 'search=desk';
    const { result } = renderHook(() => useUrlFilters(parse));
    act(() => result.current[1]({ search: undefined }));
    expect(replaceState).toHaveBeenCalledWith(null, '', window.location.pathname);
  });
});
