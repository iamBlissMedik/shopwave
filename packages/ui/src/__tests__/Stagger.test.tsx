import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stagger } from '../Stagger';

describe('Stagger', () => {
  it('renders every child inside its own animated cell', () => {
    render(
      <Stagger>
        <p>Alpha</p>
        <p>Beta</p>
      </Stagger>,
    );
    const alpha = screen.getByText('Alpha').parentElement!;
    expect(alpha).toHaveClass('animate-fade-in-up');
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('delays each item a little more than the last, with a cap', () => {
    render(
      <Stagger>
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i}>item {i}</p>
        ))}
      </Stagger>,
    );
    const delay = (i: number) => screen.getByText(`item ${i}`).parentElement!.style.animationDelay;
    expect(delay(0)).toBe('0ms');
    expect(delay(1)).toBe('40ms');
    expect(delay(13)).toBe('400ms'); // capped at 10 steps
  });

  it('forwards className and props to the container element', () => {
    render(
      <Stagger className="grid" data-testid="stagger">
        <p>x</p>
      </Stagger>,
    );
    expect(screen.getByTestId('stagger')).toHaveClass('grid');
  });
});
