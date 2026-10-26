'use client';

import Link from 'next/link';
import { ShoppingCart, Package, LogOut, Store } from 'lucide-react';
import { useAuth, ThemeToggle } from '@shopwave/hooks';
import { useCart } from '@/hooks';
import { buttonClasses } from '@shopwave/ui';

/** Storefront navigation — shopping links + auth. */
export function Navbar() {
  const { user, logout, status } = useAuth();
  const { data: cart } = useCart();
  const itemCount = cart?.itemCount ?? 0;

  const link = 'flex items-center gap-1 text-foreground transition-colors hover:text-brand';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          <Store size={22} aria-hidden /> Shopwave
        </Link>

        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {(!user || user.role === 'USER') && (
            <Link
              href="/cart"
              aria-label={
                itemCount > 0 ? `Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Cart'
              }
              className={link}
            >
              {/* The badge is anchored to the icon so it never covers the label. */}
              <span className="relative">
                <ShoppingCart size={20} aria-hidden />
                {itemCount > 0 && (
                  // Re-keyed on the count, so the CSS pop replays on every change.
                  <span
                    key={itemCount}
                    className="absolute -right-2.5 -top-2.5 flex h-[18px] min-w-[18px] animate-pop-in items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold leading-none text-brand-fg"
                  >
                    {itemCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          )}
          {user?.role === 'USER' && (
            <Link href="/orders" aria-label="Orders" className={link}>
              <Package size={20} aria-hidden />
              <span className="hidden sm:inline">Orders</span>
            </Link>
          )}

          <ThemeToggle />

          {/* Nothing while loading or unknown (API unreachable): never a misleading "Login". */}
          {user ? (
            <>
              <span className="hidden text-muted md:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Log out"
                className="flex items-center gap-1 text-foreground transition-colors hover:text-danger"
              >
                <LogOut size={18} aria-hidden /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : status === 'signed-out' ? (
            <>
              <Link href="/login" className={link}>
                Login
              </Link>
              <Link href="/register" className={buttonClasses({ size: 'sm' })}>
                Sign up
              </Link>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
