import type { ReactNode } from 'react';

/**
 * Pagination contract for presentational components. Re-exported from
 * @shopwave/types so the UI shares the API's single source of truth rather than
 * keeping a second copy that could silently drift from the server response.
 */
export type { PaginationMeta } from '@shopwave/types';

/**
 * Minimal link / image shapes so components stay framework-agnostic: the apps
 * inject Next's `Link` / `Image`, Storybook and tests fall back to `<a>` / `<img>`.
 */
export type LinkLike = (props: {
  href: string;
  className?: string;
  children: ReactNode;
}) => ReactNode;
export type ImageLike = (props: {
  src: string;
  alt: string;
  className?: string;
  /** `eager` for above-the-fold images (likely LCP); lazy otherwise. */
  loading?: 'eager' | 'lazy';
}) => ReactNode;
