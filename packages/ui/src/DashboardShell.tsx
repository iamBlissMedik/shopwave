'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { DefaultLink } from './adapters';
import type { LinkLike } from './types';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Shared dashboard layout: a sidebar on desktop, a scrollable tab strip on
 * mobile. Used by both the merchant and admin apps.
 *
 * Framework-agnostic by design: the active route comes in via `pathname` and
 * the link element via `LinkComponent` (defaults to a plain `<a>`), so the merchant
 * and admin apps pass Next's `usePathname()` + `Link`, while Storybook renders
 * it with the native defaults.
 */
export function DashboardShell({
  title,
  nav,
  pathname,
  LinkComponent: Link = DefaultLink,
  children,
}: {
  title: string;
  nav: DashboardNavItem[];
  pathname: string;
  LinkComponent?: LinkLike;
  children: ReactNode;
}) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Sidebar (desktop) / tab strip (mobile) */}
      <aside className="md:w-56 md:shrink-0">
        <h2 className="mb-3 hidden text-xs font-semibold uppercase tracking-wide text-muted md:block">
          {title}
        </h2>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-brand/10 text-brand'
                    : 'text-muted hover:bg-surface-muted hover:text-foreground',
                )}
              >
                <Icon size={16} aria-hidden /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
