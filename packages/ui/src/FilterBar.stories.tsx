import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterBar } from './FilterBar';

const meta: Meta<typeof FilterBar> = {
  title: 'Data/FilterBar',
  component: FilterBar,
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

export const WithExtraControls: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [search, setSearch] = useState('');
    return (
      <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Search products…">
        <select className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground">
          <option>All categories</option>
          <option>Audio</option>
        </select>
      </FilterBar>
    );
  },
};
