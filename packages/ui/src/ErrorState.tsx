import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Centered error / empty-state panel used by route error boundaries and
 * not-found pages across all apps. Presentational: pass actions (a retry
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
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertTriangle className="mx-auto mb-4 text-danger" size={40} aria-hidden />
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-muted">{message}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
