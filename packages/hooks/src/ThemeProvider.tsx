'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
/** Class that cross-fades every surface while the theme flips (see globals.css). */
const TRANSITION_CLASS = 'theme-transition';
const TRANSITION_MS = 250;

function readStoredTheme(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
  } catch {
    return 'system'; // storage blocked (private mode, sandboxed iframe…)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // `null` until we've read the stored preference on mount. The no-flash script
  // in <head> has already applied the right class before paint, so we must not
  // touch <html> until we know the real preference — otherwise a stored "light"
  // on a dark-mode OS would briefly flip to dark.
  const [theme, setThemeState] = useState<Theme | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => setThemeState(readStoredTheme()), []);

  // Resolve the preference, apply the class, and — when following the system —
  // keep tracking live OS theme changes.
  useEffect(() => {
    if (theme === null) return;
    const mql = window.matchMedia(DARK_QUERY);
    const apply = () => {
      const resolved = theme === 'system' ? (mql.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    apply();
    if (theme !== 'system') return;
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    // Cross-fade colours only for this switch — a permanent `transition` on every
    // element would also animate hovers and the first paint.
    const root = document.documentElement;
    root.classList.add(TRANSITION_CLASS);
    window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted, but still applied for this session.
    }
    setThemeState(next);
  }, []);

  const current = theme ?? 'system';
  const toggle = useCallback(() => {
    setTheme(current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light');
  }, [current, setTheme]);

  const value = useMemo(
    () => ({ theme: current, resolvedTheme, setTheme, toggle }),
    [current, resolvedTheme, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
