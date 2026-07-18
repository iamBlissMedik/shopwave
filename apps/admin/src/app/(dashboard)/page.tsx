'use client';

import { Users, Store, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { StatCard, RevenueChart, BarStat, formatPrice, Stagger, RevealItem, LoadingState } from '@shopwave/ui';
import { useAdminStats } from '@/hooks';

export default function AdminOverview() {
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
        <RevealItem>
          <StatCard label="Revenue" value={formatPrice(totals.revenue)} icon={DollarSign} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Orders" value={totals.orders} icon={ShoppingCart} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Users" value={totals.users} icon={Users} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Merchants" value={totals.merchants} icon={Store} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Products" value={totals.products} icon={Package} />
        </RevealItem>
      </Stagger>

      <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevealItem>
          <RevenueChart
            title="Revenue (last 14 days)"
            data={revenueByDay}
            valueFormatter={formatPrice}
            axisFormatter={(v) => `$${Math.round(v / 100)}`}
          />
        </RevealItem>
        <RevealItem>
          <BarStat title="Users by role" data={usersByRole.map((r) => ({ label: r.role, value: r.count }))} />
        </RevealItem>
      </Stagger>
    </div>
  );
}
