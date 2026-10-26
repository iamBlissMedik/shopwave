import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ChartSkeleton } from '../ChartSkeleton';

describe('ChartSkeleton', () => {
  it('reserves the chart footprint and is hidden from assistive tech', () => {
    const { container } = render(<ChartSkeleton />);
    const card = container.firstElementChild!;
    expect(card).toHaveAttribute('aria-hidden', 'true');
    expect(card.querySelector('.h-64')).not.toBeNull();
  });
});
