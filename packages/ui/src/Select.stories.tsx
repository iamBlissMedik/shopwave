import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  args: {
    'aria-label': 'Sort',
    children: (
      <>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
export const FullWidth: Story = { args: { className: 'w-full' } };
export const Disabled: Story = { args: { disabled: true } };
