import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stagger, RevealItem } from '../Stagger';

describe('Stagger', () => {
  it('renders all of its revealed children', () => {
    render(
      <Stagger>
        <RevealItem>Alpha</RevealItem>
        <RevealItem>Beta</RevealItem>
      </Stagger>,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('forwards className and props to the container element', () => {
    render(
      <Stagger className="grid" data-testid="stagger">
        <RevealItem>x</RevealItem>
      </Stagger>,
    );
    expect(screen.getByTestId('stagger')).toHaveClass('grid');
  });
});
