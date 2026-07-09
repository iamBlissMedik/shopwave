import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable, type Column } from '../DataTable';

interface Row {
  id: string;
  name: string;
  price: number;
}

const columns: Column<Row>[] = [
  { header: 'Name', cell: (r) => r.name },
  { header: 'Price', cell: (r) => `$${r.price}` },
];

const rows: Row[] = [
  { id: '1', name: 'Keyboard', price: 89 },
  { id: '2', name: 'Mouse', price: 45 },
];

describe('DataTable', () => {
  it('renders a loading state', () => {
    render(<DataTable columns={columns} rows={undefined} rowKey={(r) => r.id} isLoading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders the empty message when there are no rows', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => r.id} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders rows and headers', () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />);
    // Headers appear in both the desktop table and mobile cards, so use getAllByText.
    expect(screen.getAllByText('Keyboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$45').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
  });
});
