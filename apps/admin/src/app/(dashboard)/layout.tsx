'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package } from 'lucide-react';
import { RoleGuard } from '@shopwave/hooks';
import { DashboardShell, type DashboardNavItem } from '@shopwave/ui';

const NAV: DashboardNavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGuard allow={['ADMIN']}>
      <DashboardShell
        title="Admin"
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
