import type { Meta, StoryObj } from '@storybook/react';
import { Stagger, RevealItem } from './Stagger';
import { Card } from './Card';

const meta: Meta<typeof Stagger> = {
  title: 'Motion/Stagger',
  component: Stagger,
};
export default meta;

type Story = StoryObj<typeof Stagger>;

/** A grid whose tiles cascade in one after another on mount. */
export const Grid: Story = {
  render: () => (
    <Stagger className="grid max-w-2xl grid-cols-3 gap-4">
      {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((label) => (
        <RevealItem key={label}>
          <Card className="p-6 text-center font-semibold text-foreground">{label}</Card>
        </RevealItem>
      ))}
    </Stagger>
  ),
};
