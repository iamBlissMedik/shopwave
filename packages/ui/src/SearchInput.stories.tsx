import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Primitives/SearchInput',
  component: SearchInput,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

/** Interactive: type and watch the debounced (~400ms) committed value update. */
export const Default: Story = {
  render: () => {
    const [committed, setCommitted] = useState('');
    return (
      <div className="max-w-sm space-y-2">
        <SearchInput value={committed} onSearch={setCommitted} />
        <p className="text-xs text-muted">
          Committed after debounce:{' '}
          <span className="font-medium text-foreground">{committed || '—'}</span>
        </p>
      </div>
    );
  },
};

export const WithCustomPlaceholder: Story = {
  render: () => {
    const [committed, setCommitted] = useState('');
    return (
      <div className="max-w-sm">
        <SearchInput value={committed} onSearch={setCommitted} placeholder="Search products…" />
      </div>
    );
  },
};

export const Prefilled: Story = {
  render: () => {
    const [committed, setCommitted] = useState('headphones');
    return (
      <div className="max-w-sm">
        <SearchInput value={committed} onSearch={setCommitted} />
      </div>
    );
  },
};
