'use client';

import { Package, PackageCheck, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';
import { StatCard, RevenueChart, BarStat, formatPrice, Stagger, RevealItem, LoadingState } from '@shopwave/ui';
import { useMerchantStats } from '@/hooks';

export default function MerchantOverview() {
  const { data, isLoading } = useMerchantStats();

  if (isLoading || !data) return <LoadingState message="Loading dashboard…" />;

  const { totals, revenueByDay, topProducts } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted">Your store at a glance.</p>
      </div>

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <RevealItem>
          <StatCard label="Revenue" value={formatPrice(totals.totalRevenue)} icon={DollarSign} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Units sold" value={totals.unitsSold} icon={ShoppingBag} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Active products" value={totals.activeProducts} icon={PackageCheck} hint={`${totals.totalProducts} total`} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Low stock" value={totals.lowStock} icon={AlertTriangle} hint="≤ 5 left" />
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
          <BarStat
            title="Top products by revenue"
            data={topProducts.map((p) => ({ label: p.name, value: p.revenue }))}
            valueFormatter={formatPrice}
          />
        </RevealItem>
      </Stagger>

      {totals.totalProducts === 0 && (
        <p className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted">
          <Package className="mx-auto mb-2" /> You haven&apos;t listed any products yet. Head to{' '}
          <b>Products → Add product</b> to get started.
        </p>
      )}
    </div>
  );
}
