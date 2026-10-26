import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Inside</Card>);
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('merges a custom className with the base surface classes', () => {
    render(<Card className="p-8">Body</Card>);
    const el = screen.getByText('Body');
    expect(el.className).toContain('p-8');
    expect(el.className).toContain('bg-surface');
  });

  it('forwards native div attributes', () => {
    render(
      <Card data-testid="card" role="group">
        x
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveAttribute('role', 'group');
  });
});
