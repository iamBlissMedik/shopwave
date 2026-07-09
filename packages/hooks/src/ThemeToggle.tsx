'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, type Theme } from './useTheme';

const icons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };

/** Cycles light → dark → system. Reflects the user's explicit preference. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const Icon = icons[theme];

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-label={`Theme: ${theme}. Click to switch to ${next[theme]}.`}
      title={`Theme: ${theme}`}
      className="rounded-md p-2 text-foreground hover:bg-surface-muted"
    >
      {/* Crossfade + spin the icon as the theme cycles. `mode="wait"` lets the
          outgoing icon finish before the new one animates in. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="block"
        >
          <Icon size={18} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
