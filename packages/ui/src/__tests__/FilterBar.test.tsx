import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterBar } from '../FilterBar';

describe('FilterBar', () => {
  it('renders the search box with the given placeholder', () => {
    render(<FilterBar search="" onSearch={vi.fn()} searchPlaceholder="Search products" />);
    expect(screen.getByPlaceholderText('Search products')).toBeInTheDocument();
  });

  it('renders extra filter controls passed as children', () => {
    render(
      <FilterBar search="" onSearch={vi.fn()}>
        <button>Category</button>
      </FilterBar>,
    );
    expect(screen.getByRole('button', { name: 'Category' })).toBeInTheDocument();
  });

  it('seeds the search box with the current value', () => {
    render(<FilterBar search="desk" onSearch={vi.fn()} searchPlaceholder="Search" />);
    expect(screen.getByPlaceholderText('Search')).toHaveValue('desk');
  });
});
