'use client';

import { motion } from 'framer-motion';
import { easeOut } from '@shopwave/ui';

/**
 * App Router `template` files re-mount on every navigation, so this is the
 * natural place for a page-enter transition: each route fades and rises in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
