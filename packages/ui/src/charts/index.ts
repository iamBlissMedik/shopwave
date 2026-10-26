// `@shopwave/ui/charts` — the Recharts-based charts, on their own entry point so
// apps can lazy-load them (`next/dynamic(() => import('@shopwave/ui/charts')…)`)
// and keep Recharts (~100 kB) out of the initial bundle. Pair with the
// lightweight `ChartSkeleton` from the main entry as the loading placeholder.
export { RevenueChart, type TimePoint, type RevenueChartProps } from './RevenueChart';
export { BarStat, type BarDatum, type BarStatProps } from './BarStat';
