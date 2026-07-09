import type { Meta, StoryObj } from '@storybook/react';
import { ProductForm } from './ProductForm';

const meta: Meta<typeof ProductForm> = {
  title: 'Commerce/ProductForm',
  component: ProductForm,
  args: {
    isSubmitting: false,
    submitLabel: 'Create product',
    // eslint-disable-next-line no-console
    onSubmit: (payload) => console.log('submit', payload),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ProductForm>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    submitLabel: 'Save changes',
    initial: {
      id: 'p1',
      name: 'Aurora Wireless Headphones',
      slug: 'aurora-wireless-headphones',
      description: 'Over-ear, 40h battery, active noise cancellation.',
      price: 12900,
      imageUrl: 'https://picsum.photos/seed/aurora/600/600',
      category: 'Audio',
      stock: 8,
      isActive: true,
      merchantId: 'm1',
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    },
  },
};

export const Submitting: Story = { args: { isSubmitting: true } };
