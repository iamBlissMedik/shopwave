import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDashboard, Package, BarChart3 } from 'lucide-react';
import { DashboardShell } from './DashboardShell';

const meta: Meta<typeof DashboardShell> = {
  title: 'Layout/DashboardShell',
  component: DashboardShell,
  args: {
    title: 'Merchant',
    pathname: '/products',
    nav: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/products', label: 'Products', icon: Package },
      { href: '/sales', label: 'Sales', icon: BarChart3 },
    ],
    children: (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h1 className="text-xl font-bold">Products</h1>
        <p className="mt-2 text-sm text-muted">Your dashboard content renders here.</p>
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof DashboardShell>;

export const Default: Story = {};
export const OverviewActive: Story = { args: { pathname: '/' } };
