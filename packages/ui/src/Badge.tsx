import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export type Tone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  // FunRadar accent tones — for categories, tags and other non-status labels.
  | 'teal'
  | 'pink'
  | 'amber'
  | 'lime';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-muted',
  brand: 'bg-brand/10 text-brand',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  teal: 'bg-accent-teal/15 text-accent-teal',
  pink: 'bg-accent-pink/15 text-accent-pink',
  amber: 'bg-accent-amber/15 text-accent-amber',
  lime: 'bg-accent-lime/15 text-accent-lime',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>
      {children}
    </span>
  );
}
