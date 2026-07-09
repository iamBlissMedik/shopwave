'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import type { PaginationMeta } from './types';
import { Card } from './Card';
import { Pagination } from './Pagination';

export interface Column<T> {
  /** Column header label. */
  header: string;
  /** Renders the cell for a row. */
  cell: (row: T) => ReactNode;
  /** Optional alignment/width classes. */
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

/**
 * Reusable, presentation-only table.
 *  - Desktop (md+): a real semantic `<table>`.
 *  - Mobile (<md): a stacked card list with "Label: value" rows, so wide tables
 *    stay readable on phones.
 * Pagination is wired in when `meta` + `onPageChange` are provided.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyMessage = 'No records found.',
  meta,
  onPageChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return <Card className="p-10 text-center text-sm text-muted">Loading…</Card>;
  }
  if (!rows || rows.length === 0) {
    return <Card className="p-10 text-center text-sm text-muted">{emptyMessage}</Card>;
  }

  return (
    <div>
      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left text-xs uppercase tracking-wide text-muted">
                {columns.map((col) => (
                  <th key={col.header} className={clsx('px-4 py-3 font-medium', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                  {columns.map((col) => (
                    <td key={col.header} className={clsx('px-4 py-3 text-foreground', col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <Card key={rowKey(row)} className="divide-y divide-border">
            {columns.map((col) => (
              <div key={col.header} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-xs uppercase tracking-wide text-muted">{col.header}</span>
                <span className="text-right text-sm text-foreground">{col.cell(row)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      {meta && onPageChange && <Pagination meta={meta} onPageChange={onPageChange} />}
    </div>
  );
}
