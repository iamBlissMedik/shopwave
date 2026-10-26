'use client';

import Link from 'next/link';
import { LogOut, type LucideIcon } from 'lucide-react';
import { useAuth } from './useAuth';
import { ThemeToggle } from './ThemeToggle';

/**
 * Shared top bar for the merchant & admin dashboards — brand, current user,
 * theme toggle, logout. The only per-app differences are the brand icon and
 * label, passed as props. (The storefront has its own richer Navbar with a
 * cart, so it isn't this component.)
 */
export function DashboardNavbar({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          <Icon size={22} aria-hidden /> Shopwave <span className="text-muted">· {label}</span>
        </Link>

        <div className="flex items-center gap-3 text-sm sm:gap-4">
          <ThemeToggle />
          {isLoading ? null : user ? (
            <>
              {/* storeName for merchants, falls back to name for admins. */}
              <span className="hidden text-muted md:inline">{user.storeName ?? user.name}</span>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Log out"
                className="flex items-center gap-1 text-foreground transition-colors hover:text-danger"
              >
                <LogOut size={18} aria-hidden /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 text-foreground transition-colors hover:text-brand"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
