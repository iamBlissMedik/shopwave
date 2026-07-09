'use client';

import { Shield } from 'lucide-react';
import { DashboardNavbar } from '@shopwave/hooks';

/** Admin console top bar (shared component, admin branding). */
export function Navbar() {
  return <DashboardNavbar icon={Shield} label="Admin" />;
}
