'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { staggerContainer, fadeInUp } from './motion';

/**
 * Orchestration wrapper: mounts its children with a staggered fade-rise. Drop it
 * around a grid or list and wrap each child in `<RevealItem>`. Timing and easing
 * come from the shared `staggerContainer` / `fadeInUp` variants, so every app
 * cascades identically. Reduced-motion is honored globally via `<MotionConfig>`,
 * so there's nothing to guard for here. Accepts all `motion.div` props, so pass
 * the grid/list `className` straight through — the Stagger *is* the container.
 */
export function Stagger({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" {...props}>
      {children}
    </motion.div>
  );
}

/** A single fade-rise child of `<Stagger>` (or any `staggerContainer` parent). */
export function RevealItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={fadeInUp} {...props}>
      {children}
    </motion.div>
  );
}
