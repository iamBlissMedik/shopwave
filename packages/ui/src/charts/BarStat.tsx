'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, chartTooltipStyle } from '../chart';
import { Card } from '../Card';

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarStatProps {
  data: BarDatum[];
  title: string;
  valueFormatter?: (v: number) => string;
}

/**
 * Generic horizontal bar chart for small categorical breakdowns
 * (top products by revenue, users by role…). `valueFormatter` controls display.
 */
export function BarStat({ data, title, valueFormatter = (v) => String(v) }: BarStatProps) {
  return (
    <Card className="animate-fade-in p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No data yet.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: CHART.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip
                formatter={(v) => [valueFormatter(Number(v)), '']}
                cursor={{ fill: CHART.grid }}
                contentStyle={chartTooltipStyle}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={18}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART.series[i % CHART.series.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
