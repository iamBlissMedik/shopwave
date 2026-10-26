import { clsx } from 'clsx';

export interface SpinnerProps {
  /** Diameter preset — sm=16px, md=24px, lg=40px. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Accessible label announced to screen readers. When provided, the spinner is
   * a live `role="status"` region; when omitted it renders as a decorative
   * (`aria-hidden`) indicator — use that when nearby visible text already
   * describes the loading state (e.g. inside a `Button` or `LoadingState`).
   */
  label?: string;
  className?: string;
}

const sizes: Record<NonNullable<SpinnerProps['size']>, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

/**
 * Indeterminate loading spinner. Inherits the current text color
 * (`currentColor`), so it takes on the color of whatever it sits in — a
 * `Button`, a muted table cell, or a brand-tinted `LoadingState`.
 */
export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  const px = sizes[size];
  return (
    <span
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      className={clsx('inline-flex', className)}
    >
      <svg className="animate-spin" width={px} height={px} viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-90"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
