import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

/**
 * Surface container used across pages & dashboards for a uniform look.
 * Soft 2xl corners + a diffuse `shadow-soft` give a warmer, less boxy feel
 * than a flat bordered box. Override via `className`.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-2xl border border-border bg-surface shadow-soft', className)}
      {...props}
    />
  );
}
