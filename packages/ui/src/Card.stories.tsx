import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm p-6">
      <h3 className="font-semibold text-foreground">Card title</h3>
      <p className="mt-1 text-sm text-muted">A surface container used across pages and dashboards.</p>
    </Card>
  ),
};
