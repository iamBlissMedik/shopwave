import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

export interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

/**
 * The shared form-control look (inputs, selects, textareas). Width and border
 * colour are left to the caller so a control can be full-width in a form or
 * auto-sized in a filter bar, and flag errors with `border-danger`.
 */
export const fieldClasses =
  'rounded-lg border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40';

/** Labelled text input with an inline validation message. */
export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={clsx(
          fieldClasses,
          'w-full transition-shadow duration-150',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
