'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from './types';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

/**
 * Prev / page-indicator / Next control. Renders nothing for a single page.
 * Purely presentational — the parent owns the current page state.
 */
export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const btn =
    'flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-surface';

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPrevPage}
        className={btn}
      >
        <ChevronLeft size={16} aria-hidden /> <span className="hidden sm:inline">Prev</span>
      </button>
      <span className="text-sm text-muted">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <button
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNextPage}
        className={btn}
      >
        <span className="hidden sm:inline">Next</span> <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
