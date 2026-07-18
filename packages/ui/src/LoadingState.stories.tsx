import type { Meta, StoryObj } from '@storybook/react';
import { LoadingState } from './LoadingState';

const meta: Meta<typeof LoadingState> = {
  title: 'Feedback/LoadingState',
  component: LoadingState,
  args: { message: 'Loading…' },
};
export default meta;

type Story = StoryObj<typeof LoadingState>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: { message: 'Loading products…' },
};
