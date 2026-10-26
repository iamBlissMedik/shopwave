'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './useTheme';
import type { Theme } from './themeContext';

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
    <button
      type="button"
      onClick={toggle}
      aria-label={`Theme: ${theme}. Click to switch to ${next[theme]}.`}
      title={`Theme: ${theme}`}
      className="rounded-lg p-2 text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-surface-muted active:scale-90"
    >
      {/* Re-keyed per theme, so the CSS `spin-in` entrance replays on every switch. */}
      <span key={theme} className="block animate-spin-in">
        <Icon size={18} aria-hidden />
      </span>
    </button>
  );
}
