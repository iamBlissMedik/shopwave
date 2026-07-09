import type { Meta, StoryObj } from '@storybook/react';
import { DollarSign } from 'lucide-react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Dashboard/StatCard',
  component: StatCard,
  args: { label: 'Revenue', value: '$1,240.00', icon: DollarSign, hint: 'last 14 days' },
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};
export const Grid: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-2 gap-4">
      <StatCard label="Revenue" value="$1,240" icon={DollarSign} />
      <StatCard label="Units sold" value={42} icon={DollarSign} />
    </div>
  ),
};
