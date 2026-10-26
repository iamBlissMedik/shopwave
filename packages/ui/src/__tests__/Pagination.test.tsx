import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';
import type { PaginationMeta } from '../types';

const meta = (over: Partial<PaginationMeta> = {}): PaginationMeta => ({
  page: 2,
  limit: 10,
  total: 35,
  totalPages: 4,
  hasNextPage: true,
  hasPrevPage: true,
  ...over,
});

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(
      <Pagination meta={meta({ totalPages: 1 })} onPageChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the current page and total', () => {
    render(<Pagination meta={meta()} onPageChange={() => {}} />);
    expect(screen.getByText(/Page 2 of 4/)).toBeInTheDocument();
    expect(screen.getByText(/35 total/)).toBeInTheDocument();
  });

  it('navigates to prev/next', async () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={meta()} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: /prev/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it('disables prev on the first page', () => {
    render(<Pagination meta={meta({ page: 1, hasPrevPage: false })} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });
});
