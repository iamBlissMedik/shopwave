import type { Meta, StoryObj } from '@storybook/react';
import type { Product } from '@shopwave/types';
import { ProductCard } from './ProductCard';

const sample: Product = {
  id: 'p1',
  name: 'Aurora Wireless Headphones',
  slug: 'aurora-wireless-headphones',
  description: 'Over-ear, 40h battery, active noise cancellation and plush memory-foam cups.',
  price: 12900,
  imageUrl: 'https://picsum.photos/seed/aurora/600/600',
  category: 'Audio',
  stock: 8,
  isActive: true,
  merchantId: 'm1',
  merchant: { id: 'm1', name: 'SoundLab', storeName: 'SoundLab' },
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

const meta: Meta<typeof ProductCard> = {
  title: 'Commerce/ProductCard',
  component: ProductCard,
  args: { product: sample, href: '#', canBuy: true },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {};
export const Adding: Story = { args: { isAdding: true } };
export const OutOfStock: Story = { args: { product: { ...sample, stock: 0 } } };
export const ViewOnly: Story = { args: { canBuy: false } };
