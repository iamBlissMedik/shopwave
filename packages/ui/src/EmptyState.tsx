import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  message?: string;
  /** Illustrative icon above the title. */
  icon?: LucideIcon;
  /** Icon colour — muted for "nothing here yet", danger for errors. */
  tone?: 'muted' | 'danger';
  /** Use `h1` when the panel is the whole page (e.g. an empty cart page). */
  headingLevel?: 'h1' | 'h2';
  /** Actions (a `Button`, a `Link` styled with `buttonClasses()`, …). */
  children?: ReactNode;
}

/**
 * Centered panel for "nothing to show" moments: an empty cart, no orders yet,
 * no filter matches. `ErrorState` is the same layout in the danger tone, so
 * every empty / error / not-found screen across the apps looks alike.
 */
export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  tone = 'muted',
  headingLevel: Heading = 'h2',
  children,
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Icon
        className={clsx('mx-auto mb-4', tone === 'danger' ? 'text-danger' : 'text-muted')}
        size={40}
        aria-hidden
      />
      <Heading className="text-2xl font-bold text-foreground">{title}</Heading>
      {message && <p className="mt-2 text-muted">{message}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
