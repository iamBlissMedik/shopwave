import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  args: { label: 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-brand">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const InheritsColor: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <span className="text-brand">
        <Spinner />
      </span>
      <span className="text-muted">
        <Spinner />
      </span>
      <span className="text-danger">
        <Spinner />
      </span>
    </div>
  ),
};
