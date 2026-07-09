/**
 * Shared motion vocabulary for every app.
 *
 * Keeping variants/transitions in one place means the user, merchant and admin
 * apps animate with identical timing and easing — so motion feels like one
 * system. Reduced-motion is handled globally by `<MotionConfig reducedMotion="user">`
 * in `@shopwave/hooks`'s AppProviders, so these variants don't guard for it.
 */
import type { Transition, Variants } from 'framer-motion';

/** Standard easing — a gentle ease-out used for most enter transitions. */
export const easeOut: Transition['ease'] = [0.16, 1, 0.3, 1];

/** A springy pop, used for badges and other "appear" accents. */
export const spring: Transition = { type: 'spring', stiffness: 500, damping: 30 };

/** Fade + rise. The workhorse entrance for sections and cards. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

/** Container that staggers its children's entrances. Pair with `fadeInUp`. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** Pop-in used for the cart count badge. */
export const badgePop: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: spring },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};
