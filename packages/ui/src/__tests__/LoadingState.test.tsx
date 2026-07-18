import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders the default message', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  });

  it('renders a custom message', () => {
    render(<LoadingState message="Loading products…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading products…');
  });
});
