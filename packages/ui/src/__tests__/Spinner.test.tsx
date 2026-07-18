import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('exposes an accessible status when given a label', () => {
    render(<Spinner label="Loading orders" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading orders');
  });

  it('is decorative (no status role) when no label is provided', () => {
    render(<Spinner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
