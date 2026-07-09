'use client';

import { Store } from 'lucide-react';
import { DashboardNavbar } from '@shopwave/hooks';

/** Merchant dashboard top bar (shared component, merchant branding). */
export function Navbar() {
  return <DashboardNavbar icon={Store} label="Merchant" />;
}
