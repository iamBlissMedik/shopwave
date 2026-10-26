'use client';

import dynamic from 'next/dynamic';
import { Package, PackageCheck, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  ChartSkeleton,
  EmptyState,
  LoadingState,
  Stagger,
  StatCard,
  buttonClasses,
  formatPrice,
} from '@shopwave/ui';
import { useMerchantStats } from '@/hooks';

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

/** Headline metrics, the 14-day revenue chart and top products. */
export function OverviewView() {
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
        <StatCard label="Revenue" value={formatPrice(totals.totalRevenue)} icon={DollarSign} />
        <StatCard label="Units sold" value={totals.unitsSold} icon={ShoppingBag} />
        <StatCard
          label="Active products"
          value={totals.activeProducts}
          icon={PackageCheck}
          hint={`${totals.totalProducts} total`}
        />
        <StatCard label="Low stock" value={totals.lowStock} icon={AlertTriangle} hint="≤ 5 left" />
      </Stagger>

      <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart
          title="Revenue (last 14 days)"
          data={revenueByDay}
          valueFormatter={formatPrice}
          axisFormatter={(v) => `$${Math.round(v / 100)}`}
        />
        <BarStat
          title="Top products by revenue"
          data={topProducts.map((p) => ({ label: p.name, value: p.revenue }))}
          valueFormatter={formatPrice}
        />
      </Stagger>

      {totals.totalProducts === 0 && (
        <Card>
          <EmptyState
            icon={Package}
            title="No products yet"
            message="List your first product to start selling."
          >
            <Link href="/products/new" className={buttonClasses()}>
              Add product
            </Link>
          </EmptyState>
        </Card>
      )}
    </div>
  );
}
