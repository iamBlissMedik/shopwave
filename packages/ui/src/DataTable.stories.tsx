import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, type Column } from './DataTable';
import { Badge } from './Badge';

interface Row {
  id: string;
  name: string;
  price: string;
  status: 'active' | 'inactive';
}

const rows: Row[] = [
  { id: '1', name: 'Aurora Headphones', price: '$129.99', status: 'active' },
  { id: '2', name: 'Pulse Speaker', price: '$59.99', status: 'active' },
  { id: '3', name: 'Echo Mic', price: '$79.99', status: 'inactive' },
];

const columns: Column<Row>[] = [
  { header: 'Product', cell: (r) => r.name },
  { header: 'Price', cell: (r) => r.price },
  {
    header: 'Status',
    cell: (r) => <Badge tone={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge>,
  },
];

const meta: Meta<typeof DataTable<Row>> = {
  title: 'Data/DataTable',
  component: DataTable,
};
export default meta;

type Story = StoryObj<typeof DataTable<Row>>;

export const Default: Story = {
  args: { columns, rows, rowKey: (r: Row) => r.id },
};
export const Empty: Story = {
  args: { columns, rows: [], rowKey: (r: Row) => r.id, emptyMessage: 'No products yet.' },
};
export const Loading: Story = {
  args: { columns, rows: undefined, rowKey: (r: Row) => r.id, isLoading: true },
};
