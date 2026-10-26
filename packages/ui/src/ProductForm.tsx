'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  productSchema,
  type ProductValues,
  type Product,
  type ProductPayload,
} from '@shopwave/types';
import { clsx } from 'clsx';
import { Card } from './Card';
import { Input, fieldClasses } from './Input';
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
  const defaults: Partial<ProductValues> = initial
    ? {
        name: initial.name,
        description: initial.description,
        priceDollars: initial.price / 100,
        category: initial.category,
        stock: initial.stock,
        imageUrl: initial.imageUrl,
      }
    : { stock: 0 };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductValues>({ resolver: zodResolver(productSchema), defaultValues: defaults });

  // react-hook-form applies `defaultValues` through refs after hydration; also
  // setting the native `defaultValue` puts them in the server-rendered HTML, so
  // an edit form never flashes empty.
  const field = (name: keyof ProductValues) => ({
    defaultValue: defaults[name],
    ...register(name),
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
        <Input id="name" label="Product name" error={errors.name?.message} {...field('name')} />

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            aria-invalid={errors.description ? true : undefined}
            className={clsx(
              fieldClasses,
              'w-full',
              errors.description ? 'border-danger' : 'border-border',
            )}
            {...field('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            id="priceDollars"
            type="number"
            step="0.01"
            label="Price ($)"
            error={errors.priceDollars?.message}
            {...field('priceDollars')}
          />
          <Input
            id="stock"
            type="number"
            label="Stock"
            error={errors.stock?.message}
            {...field('stock')}
          />
          <Input
            id="category"
            label="Category"
            error={errors.category?.message}
            {...field('category')}
          />
        </div>

        <Input
          id="imageUrl"
          label="Image URL (optional)"
          placeholder="https://…  (a placeholder is generated if left blank)"
          error={errors.imageUrl?.message}
          {...field('imageUrl')}
        />

        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
