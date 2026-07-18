'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Package, LogOut, Store } from 'lucide-react';
import { useAuth, ThemeToggle } from '@shopwave/hooks';
import { useCart } from '@/hooks';
import { badgePop } from '@shopwave/ui';

/** Storefront navigation — shopping links + auth. */
export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { data: cart } = useCart();
  const itemCount = cart?.itemCount ?? 0;

  const link = 'flex items-center gap-1 text-foreground hover:text-brand';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          <Store size={22} /> Shopwave
        </Link>

        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {(!user || user.role === 'USER') && (
            <Link href="/cart" className={`relative ${link}`}>
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    variants={badgePop}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-brand-fg"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}
          {user?.role === 'USER' && (
            <Link href="/orders" className={link}>
              <Package size={20} />
              <span className="hidden sm:inline">Orders</span>
            </Link>
          )}

          <ThemeToggle />

          {isLoading ? null : user ? (
            <>
              <span className="hidden text-muted md:inline">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={() => logout()} className="flex items-center gap-1 text-foreground hover:text-danger">
                <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={link}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-brand-fg hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
