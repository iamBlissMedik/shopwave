import { clsx } from 'clsx';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  isLoading?: boolean;
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand text-brand-fg hover:opacity-90',
  secondary: 'bg-surface text-foreground border border-border hover:bg-surface-muted',
  ghost: 'bg-transparent text-foreground hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          Please wait…
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = 'Button';
