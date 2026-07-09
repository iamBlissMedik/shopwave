import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarStat } from '../charts/BarStat';

describe('BarStat', () => {
  it('renders the title', () => {
    render(<BarStat title="Top products" data={[{ label: 'Desk', value: 10 }]} />);
    expect(screen.getByText('Top products')).toBeInTheDocument();
  });

  it('shows an empty state when there is no data', () => {
    render(<BarStat title="Top products" data={[]} />);
    expect(screen.getByText('No data yet.')).toBeInTheDocument();
  });

  it('renders the chart region (not the empty state) when data is present', () => {
    render(<BarStat title="Top products" data={[{ label: 'Desk', value: 10 }]} />);
    expect(screen.queryByText('No data yet.')).not.toBeInTheDocument();
  });
});
