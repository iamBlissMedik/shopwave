import type { Meta, StoryObj } from '@storybook/react';
import { ChartSkeleton } from './ChartSkeleton';

const meta: Meta<typeof ChartSkeleton> = {
  title: 'Charts/ChartSkeleton',
  component: ChartSkeleton,
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
};
export default meta;

type Story = StoryObj<typeof ChartSkeleton>;

export const Default: Story = {};
