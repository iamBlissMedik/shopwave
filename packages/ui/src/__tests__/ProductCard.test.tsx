import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Product } from '@shopwave/types';
import { ProductCard } from '../ProductCard';

const base: Product = {
  id: 'p1',
  name: 'Aurora Headphones',
  slug: 'aurora-headphones',
  description: 'Comfy over-ear cans.',
  price: 12900,
  imageUrl: 'https://example.com/a.jpg',
  category: 'Audio',
  stock: 5,
  isActive: true,
  merchantId: 'm1',
  merchant: { id: 'm1', name: 'SoundLab', storeName: 'SoundLab' },
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
};

describe('ProductCard', () => {
  it('renders name, category and formatted price', () => {
    render(<ProductCard product={base} href="/products/p1" />);
    expect(screen.getByText('Aurora Headphones')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('$129.00')).toBeInTheDocument();
  });

  it('calls onAdd when the Add button is clicked', () => {
    const onAdd = vi.fn();
    render(<ProductCard product={base} href="/products/p1" onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('disables the button and shows "Sold out" when out of stock', () => {
    render(<ProductCard product={{ ...base, stock: 0 }} href="/products/p1" />);
    const btn = screen.getByRole('button', { name: /sold out/i });
    expect(btn).toBeDisabled();
  });

  it('hides the Add button when the viewer cannot buy', () => {
    render(<ProductCard product={base} href="/products/p1" canBuy={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
