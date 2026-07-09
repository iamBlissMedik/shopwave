'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART } from '../chart';
import { Card } from '../Card';

export interface TimePoint {
  date: string; // yyyy-mm-dd
  value: number;
}

export interface RevenueChartProps {
  data: TimePoint[];
  title: string;
  /** Formats a value for the tooltip (e.g. money). */
  valueFormatter?: (v: number) => string;
  /** Formats the Y axis ticks (kept terse). */
  axisFormatter?: (v: number) => string;
}

/**
 * Generic revenue/quantity-over-time area chart. App-agnostic: pass any dated
 * series plus formatters. Used by the merchant & admin dashboards.
 */
export function RevenueChart({
  data,
  title,
  valueFormatter = (v) => String(v),
  axisFormatter = (v) => String(v),
}: RevenueChartProps) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART.brand} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART.brand} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART.axis, fontSize: 11 }}
              tickFormatter={(d: string) => d.slice(5)} // MM-DD
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis
              tick={{ fill: CHART.axis, fontSize: 11 }}
              tickFormatter={axisFormatter}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v: number) => [valueFormatter(v), 'Revenue']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#0f172a' }}
            />
            <Area type="monotone" dataKey="value" stroke={CHART.brand} strokeWidth={2} fill="url(#rev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
