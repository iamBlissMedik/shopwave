'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductValues, type Product, type ProductPayload } from '@shopwave/types';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';

/**
 * Create/edit form shared by both merchant product pages. Presentational: it
 * takes `initial` + an `onSubmit` callback and owns no data fetching, so it is
 * fully Storybook-able. The form works in dollars for the price; we convert to
 * integer cents before handing the payload to the caller (the API stores money
 * as cents).
 */
export function ProductForm({
  initial,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  initial?: Product;
  onSubmit: (payload: ProductPayload) => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description,
          priceDollars: initial.price / 100,
          category: initial.category,
          stock: initial.stock,
          imageUrl: initial.imageUrl,
        }
      : { stock: 0 },
  });

  const submit = (values: ProductValues) =>
    onSubmit({
      name: values.name,
      description: values.description,
      price: Math.round(values.priceDollars * 100), // dollars → cents
      category: values.category,
      stock: values.stock,
      imageUrl: values.imageUrl || undefined,
    });

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input id="name" label="Product name" error={errors.name?.message} {...register('name')} />

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            id="priceDollars"
            type="number"
            step="0.01"
            label="Price ($)"
            error={errors.priceDollars?.message}
            {...register('priceDollars')}
          />
          <Input id="stock" type="number" label="Stock" error={errors.stock?.message} {...register('stock')} />
          <Input id="category" label="Category" error={errors.category?.message} {...register('category')} />
        </div>

        <Input
          id="imageUrl"
          label="Image URL (optional)"
          placeholder="https://…  (a placeholder is generated if left blank)"
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />

        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
