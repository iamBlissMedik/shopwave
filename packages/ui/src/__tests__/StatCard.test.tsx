import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign } from 'lucide-react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Revenue" value="$1,240" icon={DollarSign} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,240')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<StatCard label="Orders" value={42} icon={DollarSign} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows the hint only when provided', () => {
    const { rerender } = render(
      <StatCard label="Orders" value={1} icon={DollarSign} hint="this week" />,
    );
    expect(screen.getByText('this week')).toBeInTheDocument();

    rerender(<StatCard label="Orders" value={1} icon={DollarSign} />);
    expect(screen.queryByText('this week')).not.toBeInTheDocument();
  });
});
