import { Children, type HTMLAttributes } from 'react';

/** Delay between consecutive items, and the cap so long lists don't drag. */
const STEP_MS = 40;
const MAX_STEPS = 10;

/**
 * Staggered entrance for a grid or list: each child fades and rises in, one
 * after another. Pure CSS (the `animate-fade-in-up` keyframe + a per-item
 * delay), so it needs no client JavaScript, plays on server-rendered HTML the
 * moment it paints, and honours "reduce motion" via globals.css.
 *
 * The `Stagger` *is* the container — pass the grid/list `className` straight
 * through. Each child is wrapped in an animated cell that stretches its content
 * to full height, so cards in a row stay equal height. Re-key the `Stagger`
 * (e.g. on a filter change) to replay the cascade.
 */
export function Stagger({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {Children.map(children, (child, i) => (
        <div
          className="animate-fade-in-up [&>*]:h-full"
          style={{ animationDelay: `${Math.min(i, MAX_STEPS) * STEP_MS}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
