import { Card } from './Card';

/**
 * Placeholder with the exact footprint of a `RevenueChart` / `BarStat` card
 * (title row + 16rem plot), shown while a lazily-loaded chart's code arrives —
 * so the dashboard doesn't shift when the chart swaps in.
 */
export function ChartSkeleton() {
  return (
    <Card className="p-4" aria-hidden>
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-surface-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
    </Card>
  );
}
