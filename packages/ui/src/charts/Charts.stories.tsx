import type { Meta, StoryObj } from '@storybook/react';
import { RevenueChart } from './RevenueChart';
import { BarStat } from './BarStat';

const revenue = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-06-${String(i + 1).padStart(2, '0')}`,
  value: Math.round(2000 + Math.sin(i) * 1500 + i * 200),
}));

const meta: Meta = { title: 'Charts/Dashboard charts' };
export default meta;

type Story = StoryObj;

export const Revenue: Story = {
  render: () => (
    <div className="max-w-xl">
      <RevenueChart
        title="Revenue (last 14 days)"
        data={revenue}
        valueFormatter={(v) => `$${(v / 100).toFixed(2)}`}
        axisFormatter={(v) => `$${Math.round(v / 100)}`}
      />
    </div>
  ),
};

export const TopProducts: Story = {
  render: () => (
    <div className="max-w-xl">
      <BarStat
        title="Top products by revenue"
        data={[
          { label: 'Headphones', value: 42000 },
          { label: 'Speaker', value: 31000 },
          { label: 'Keyboard', value: 18000 },
        ]}
        valueFormatter={(v) => `$${(v / 100).toFixed(0)}`}
      />
    </div>
  ),
};
