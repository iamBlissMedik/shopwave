import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Data/Pagination',
  component: Pagination,
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(2);
    const totalPages = 5;
    return (
      <Pagination
        meta={{
          page,
          limit: 10,
          total: 48,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        }}
        onPageChange={setPage}
      />
    );
  },
};
