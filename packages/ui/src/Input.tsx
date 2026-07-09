import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const fieldClasses =
  'w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-brand/40';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(fieldClasses, error ? 'border-danger' : 'border-border', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
