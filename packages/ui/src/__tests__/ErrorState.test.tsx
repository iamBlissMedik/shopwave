import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders the default title, the message and action children', () => {
    render(
      <ErrorState message="Could not load.">
        <button>Retry</button>
      </ErrorState>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Could not load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('allows a custom title', () => {
    render(<ErrorState title="Page not found" message="Gone." />);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });
});
