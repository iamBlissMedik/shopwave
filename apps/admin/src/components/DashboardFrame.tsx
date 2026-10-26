'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users } from 'lucide-react';
import { DashboardShell, type DashboardNavItem } from '@shopwave/ui';

// Lives in a client module: icons are components, which can't be passed as
// props from the (server) dashboard layout.
const NAV: DashboardNavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
];

/** Sidebar / tab-strip shell with the active route highlighted. */
export function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Admin" nav={NAV} pathname={usePathname()} LinkComponent={Link}>
      {children}
    </DashboardShell>
  );
}
