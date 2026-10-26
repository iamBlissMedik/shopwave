'use client';

import dynamic from 'next/dynamic';
import { Users, Store, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { ChartSkeleton, LoadingState, Stagger, StatCard, formatPrice } from '@shopwave/ui';
import { useAdminStats } from '@/hooks';

// Recharts is ~100 kB: load it after the stat cards are interactive, behind a
// same-size skeleton so nothing shifts when the charts arrive.
const RevenueChart = dynamic(() => import('@shopwave/ui/charts').then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const BarStat = dynamic(() => import('@shopwave/ui/charts').then((m) => m.BarStat), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

/** Marketplace-wide metrics, the 14-day revenue chart and users by role. */
export function OverviewView() {
  const { data, isLoading } = useAdminStats();

  if (isLoading || !data) return <LoadingState message="Loading dashboard…" />;

  const { totals, usersByRole, revenueByDay } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform overview</h1>
        <p className="text-sm text-muted">Marketplace-wide metrics.</p>
      </div>

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Revenue" value={formatPrice(totals.revenue)} icon={DollarSign} />
        <StatCard label="Orders" value={totals.orders} icon={ShoppingCart} />
        <StatCard label="Users" value={totals.users} icon={Users} />
        <StatCard label="Merchants" value={totals.merchants} icon={Store} />
        <StatCard label="Products" value={totals.products} icon={Package} />
      </Stagger>

      <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart
          title="Revenue (last 14 days)"
          data={revenueByDay}
          valueFormatter={formatPrice}
          axisFormatter={(v) => `$${Math.round(v / 100)}`}
        />
        <BarStat
          title="Users by role"
          data={usersByRole.map((r) => ({ label: r.role, value: r.count }))}
        />
      </Stagger>
    </div>
  );
}
