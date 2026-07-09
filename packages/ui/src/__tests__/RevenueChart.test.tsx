import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevenueChart } from '../charts/RevenueChart';

describe('RevenueChart', () => {
  it('renders the title', () => {
    render(<RevenueChart title="Revenue" data={[{ date: '2026-07-01', value: 100 }]} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('mounts without crashing on an empty series', () => {
    render(<RevenueChart title="Revenue" data={[]} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });
});
