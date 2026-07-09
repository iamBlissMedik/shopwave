import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '@shopwave/types';
import { ProductForm } from '../ProductForm';

/**
 * Fill every required field with valid values. The price is set via
 * `fireEvent.change` rather than per-keystroke typing because the field is a
 * stepped `type="number"` input — jsdom rejects intermediate values that break
 * the `step="0.01"` constraint (e.g. a third decimal), which would silently
 * clear the field.
 */
async function fillValid(
  user: ReturnType<typeof userEvent.setup>,
  { price = '12.99', stock = '7' }: { price?: string; stock?: string } = {},
) {
  await user.type(screen.getByLabelText('Product name'), 'Aurora Headphones');
  await user.type(screen.getByLabelText('Description'), 'Comfy over-ear cans with great sound.');
  await user.type(screen.getByLabelText('Stock'), stock);
  await user.type(screen.getByLabelText('Category'), 'Audio');
  fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: price } });
}

const initial: Product = {
  id: 'p1',
  name: 'Aurora Headphones',
  slug: 'aurora-headphones',
  description: 'Comfy over-ear cans with great sound.',
  price: 12900, // cents → $129.00
  imageUrl: 'https://example.com/a.jpg',
  category: 'Audio',
  stock: 5,
  isActive: true,
  merchantId: 'm1',
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
};

describe('ProductForm', () => {
  it('converts the dollar price to integer cents on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create product" />);

    await fillValid(user, { price: '12.99', stock: '7' });
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ price: 1299, stock: 7, category: 'Audio' }),
    );
  });

  it('rounds away floating-point error on 2-decimal prices', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create product" />);

    // 19.99 × 100 = 1998.9999999999998 in JS — naive truncation would give
    // 1998; Math.round yields the correct 1999. (The input's step="0.01" blocks
    // sub-cent entry, so 2-decimal float error is the case that matters.)
    await fillValid(user, { price: '19.99' });
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].price).toBe(1999);
  });

  it('omits the image URL (undefined) when left blank', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create product" />);

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].imageUrl).toBeUndefined();
  });

  it('pre-fills the price in dollars from an existing product (cents → dollars)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ProductForm initial={initial} onSubmit={onSubmit} isSubmitting={false} submitLabel="Save" />,
    );

    // 12900 cents shows as 129 dollars in the field.
    expect((screen.getByLabelText('Price ($)') as HTMLInputElement).value).toBe('129');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    // Round-trips back to cents unchanged.
    expect(onSubmit.mock.calls[0][0].price).toBe(12900);
  });

  it('blocks submit and shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create product" />);

    // Submit an empty form.
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/min 10 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a non-positive price', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} submitLabel="Create product" />);

    await fillValid(user, { price: '0' });
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText(/greater than 0/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
