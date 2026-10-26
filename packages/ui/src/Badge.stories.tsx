import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    tone: {
      control: 'select',
      options: [
        'neutral',
        'brand',
        'success',
        'warning',
        'danger',
        'teal',
        'pink',
        'amber',
        'lime',
      ],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const StatusTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="brand">Merchant</Badge>
      <Badge tone="success">Paid</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Cancelled</Badge>
    </div>
  ),
};

export const AccentTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="teal">Teal</Badge>
      <Badge tone="pink">Pink</Badge>
      <Badge tone="amber">Amber</Badge>
      <Badge tone="lime">Lime</Badge>
    </div>
  ),
};
