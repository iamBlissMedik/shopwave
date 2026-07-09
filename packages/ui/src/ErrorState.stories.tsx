import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState } from './ErrorState';
import { Button } from './Button';

const meta: Meta<typeof ErrorState> = {
  title: 'Feedback/ErrorState',
  component: ErrorState,
  args: { message: 'We couldn’t load this page. Please try again.' },
};
export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {};

export const WithRetry: Story = {
  args: {
    title: 'Something went wrong',
    children: <Button>Try again</Button>,
  },
};

export const NotFound: Story = {
  args: {
    title: 'Page not found',
    message: 'The page you’re looking for doesn’t exist or has moved.',
    children: <Button variant="secondary">Go home</Button>,
  },
};
