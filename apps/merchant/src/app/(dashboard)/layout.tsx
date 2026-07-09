'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Receipt } from 'lucide-react';
import { RoleGuard } from '@shopwave/hooks';
import { DashboardShell, type DashboardNavItem } from '@shopwave/ui';

const NAV: DashboardNavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/sales', label: 'Sales', icon: Receipt },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGuard allow={['MERCHANT']}>
      <DashboardShell
        title="Merchant"
        nav={NAV}
        pathname={pathname}
        LinkComponent={({ href, className, children }) => (
          <Link href={href} className={className}>
            {children}
          </Link>
        )}
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
