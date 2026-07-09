/**
 * Bucket dated values into the last `days` calendar days (UTC), filling gaps
 * with zero so charts have a continuous x-axis. Shared by the merchant and
 * admin dashboards.
 */
export function buildDailySeries(points: { date: Date; value: number }[], days: number) {
  const buckets = new Map<string, number>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of points) {
    const key = new Date(p.date).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + p.value);
  }
  return [...buckets.entries()].map(([date, value]) => ({ date, value }));
}
