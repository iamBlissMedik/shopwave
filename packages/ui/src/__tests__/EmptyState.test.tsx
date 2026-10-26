import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title, message and actions', () => {
    render(
      <EmptyState title="Your cart is empty" message="Add something you like.">
        <a href="/">Continue shopping</a>
      </EmptyState>,
    );
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
    expect(screen.getByText('Add something you like.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/');
  });

  it('omits the message and actions when not given', () => {
    const { container } = render(<EmptyState title="No sales yet" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
