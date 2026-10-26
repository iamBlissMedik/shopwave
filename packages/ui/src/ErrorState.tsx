import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from './EmptyState';

/**
 * Centered error panel used by route error boundaries, not-found pages and
 * failed fetches across all apps. Presentational: pass actions (a retry
 * `Button`, a `Link` home, …) as children.
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  children,
}: {
  title?: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState
      title={title}
      message={message}
      icon={AlertTriangle}
      tone="danger"
      headingLevel="h1"
    >
      {children}
    </EmptyState>
  );
}
