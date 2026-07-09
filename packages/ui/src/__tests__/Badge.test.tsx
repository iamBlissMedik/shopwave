import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>PAID</Badge>);
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  it('applies the tone class', () => {
    render(<Badge tone="success">Active</Badge>);
    expect(screen.getByText('Active').className).toContain('text-success');
  });
});
