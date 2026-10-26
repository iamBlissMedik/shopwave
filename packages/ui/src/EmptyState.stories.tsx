import type { Meta, StoryObj } from '@storybook/react';
import { PackageOpen, ShoppingCart } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { buttonClasses } from './Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  args: { title: 'No products match your filters', message: 'Try a different search or category.' },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    icon: ShoppingCart,
    title: 'Your cart is empty',
    message: 'Browse the marketplace and add something you like.',
    children: (
      <a href="#" className={buttonClasses()}>
        Continue shopping
      </a>
    ),
  },
};

export const TitleOnly: Story = {
  args: { icon: PackageOpen, title: 'No sales yet', message: undefined },
};
