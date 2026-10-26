import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import { fieldClasses } from './Input';

export type SelectProps = ComponentProps<'select'>;

/**
 * Native `<select>` with the shared form-control styling. Auto-width by default
 * so it sits naturally in a `FilterBar` or table cell; pass `className="w-full"`
 * for form layouts. Give it an `aria-label` when there is no visible label.
 */
export function Select({ className, ...props }: SelectProps) {
  return <select className={clsx(fieldClasses, 'border-border', className)} {...props} />;
}
